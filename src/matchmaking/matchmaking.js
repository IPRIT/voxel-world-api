import Promise from 'bluebird';
import request from 'request-promise';
import { GameStatus, GameStatusPriority } from "./servers";
import { GameServer } from "../models/GameServer";
import { GameInstance } from "../models/GameInstance";
import { GameSession } from "../models/GameSession";
import { generateCryptoToken } from "../utils";
import { QueueEvents } from "./queue";

/**
 * @param {Array<Object>} servers
 * @param {Array<QueueItem>} queueItems
 */
export async function matchmake (servers = [], queueItems = []) {
  queueItems = queueItems.slice(); // shallow copy of array
  const sortedServers = sortAvailableServers( servers );
  const pickedItems = [];

  for (let i = 0; i < sortedServers.length; ++i) {
    const server = sortedServers[ i ];
    const playersToJoin = Math.max(
      0, server.status.maxPlayersNumber - server.status.playersNumber
    );
    if (!playersToJoin) {
      continue;
    }

    const items = queueItems.splice( 0, playersToJoin );
    if (items.length) {
      await joinToServer( server, items );
      pickedItems.push( ...items );
    }
  }

  return pickedItems;
}

/**
 * @param {Object} serverToConnect
 * @param {Array<QueueItem>} queueItems
 */
async function joinToServer (serverToConnect, queueItems) {
  console.log( '[MatchMaking] Connecting to server id:', serverToConnect.server.id, ' Queue items:', queueItems.map(v => v.playerId) );

  const usersMap = buildUsersMap( queueItems );

  return findOrCreateInstance( serverToConnect ).then(gameInstance => {
    return Promise.all([
      gameInstance,
      Promise.all(
        Array( queueItems.length ).fill( 0 ).map(_ => generateCryptoToken())
      )
    ]);
  }).spread((gameInstance, sessionTokens) => {
    const bulkSessions = [];

    for (let i = 0; i < queueItems.length; ++i) {
      const queueItem = queueItems[ i ];
      const { player } = queueItem;
      const { user } = player;

      bulkSessions.push({
        nickname: user.nickname,
        sessionToken: sessionTokens[ i ],
        userId: user.id,
        instanceId: gameInstance.id
      });
    }

    return GameSession.bulkCreate( bulkSessions );
  }).tap(sessions => {
    console.log( `[MatchMaking] Created ${sessions.length} game sessions.` );
  }).map(session => {
    const queueItem = usersMap.get( session.userId );

    if (!queueItem) {
      console.warn( '[MatchMaking] Queue item not found for session:', session.toJSON() );
      return;
    }

    const { player } = queueItem;
    const { socket } = player;

    const serverInfo = {
      server: serverToConnect.server,
      session: session.toJSON()
    };

    socket.emit( QueueEvents.SERVER_FOUND, serverInfo );

    return session;
  });
}

/**
 * @param {Object} targetServer
 * @return {Promise<GameInstance>}
 */
async function findOrCreateInstance (targetServer) {
  const { server, status } = targetServer;

  if (status.status === GameStatus.FREE) {
    return createGameInstance( server );
  } else if ([ GameStatus.WAITING_FOR_PLAYERS, GameStatus.PREPARING ].includes( status.status )) {
    return GameInstance.findById( status.instanceId || 1 );
  }

  throw new Error( 'Unable to create game instance' );
}

/**
 * @param {Object} server
 * @return {Promise<GameInstance>}
 */
async function createGameInstance (server) {
  return GameServer.findById( server.id ).then(serverInstance => {
    return serverInstance.createGameInstance({
      gameType: server.gameType
    });
  }).tap(gameInstance => {
    console.log( `[MatchMaking] Created 1 game instance with id: ${gameInstance.id}` );
  }).then(gameInstance => {
    return setInstanceRemote( server, gameInstance ).then(_ => {
      return gameInstance;
    });
  });
}

/**
 * @param {GameServer} server
 * @param {GameInstance} gameInstance
 * @return {Promise<*>}
 */
async function setInstanceRemote (server, gameInstance) {
  const endpoint = `http://${server.publicIp}/api/game/instance`;
  return request({
    method: 'POST',
    uri: endpoint,
    json: true,
    body: {
      instance: gameInstance.toJSON()
    }
  });
}

/**
 * @param {Array<{server: *, status: *}>} servers
 * @return {Array<{server: *, status: *}>}
 */
function sortAvailableServers (servers = []) {
  const statusPriority = GameStatusPriority;

  return servers.sort((serverA, serverB) => {
    const statusA = serverA.status;
    const statusB = serverB.status;
    if (statusA.status === statusB.status) {
      return statusB.playersNumber - statusA.playersNumber;
    } else if (statusPriority[ statusA.status ] > statusPriority[ statusB.status ]) {
      return -1;
    } else if (statusPriority[ statusA.status ] < statusPriority[ statusB.status ]) {
      return 1;
    }
  });
}

/**
 * @param {Array<QueueItem>} queueItems
 * @return {Map<number, QueueItem>}
 */
function buildUsersMap (queueItems) {
  const map = new Map();

  for (let i = 0; i < queueItems.length; ++i) {
    const queueItem = queueItems[ i ];
    const { player } = queueItem;
    map.set( player.id, queueItem );
  }

  return map;
}