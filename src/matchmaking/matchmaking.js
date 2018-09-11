import Promise from 'bluebird';
import request from 'request-promise';
import { GameStatus, GameStatusPriority } from "./servers";
import { GameServer } from "../models/GameServer";
import { GameInstance } from "../models/GameInstance";
import { GameSession } from "../models/GameSession";
import { generateCryptoToken } from "../utils";
import { QueueEvents } from "./queue";

/**
 * @param {Array<Object>} serverStatuses
 * @param {Array<QueueItem>} queueItems
 */
export async function matchmaker (serverStatuses = [], queueItems = []) {
  queueItems = queueItems.slice(); // shallow copy of array
  const sortedStatuses = sortAvailableServers( serverStatuses );
  const pickedItems = [];

  for (let i = 0; i < sortedStatuses.length; ++i) {
    const serverStatus = sortedStatuses[ i ];
    const playersToJoin = Math.max(
      0, serverStatus.maxPlayersNumber - serverStatus.playersNumber
    );
    if (!playersToJoin) {
      continue;
    }

    const items = queueItems.splice( 0, playersToJoin );
    if (items.length) {
      await joinToServer( serverStatus, items );
      pickedItems.push( ...items );
    }
  }

  return pickedItems;
}

/**
 * @param {ServerStatus} serverStatus
 * @param {Array<QueueItem>} queueItems
 */
async function joinToServer (serverStatus, queueItems) {
  console.log(
    '[MatchMaking] Connecting to server id:',
    serverStatus.server.id,
    '. Queue items:', queueItems.map(v => v.playerId)
  );

  serverStatus.lock( 5000 );

  const usersMap = buildUsersMap( queueItems );

  return findOrCreateInstance( serverStatus ).then(gameInstance => {
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
      server: serverStatus.server,
      session: session.toJSON()
    };

    socket.emit( QueueEvents.SERVER_FOUND, serverInfo );

    return session;
  });
}

/**
 * @param {ServerStatus} serverStatus
 * @return {Promise<GameInstance>}
 */
async function findOrCreateInstance (serverStatus) {
  const { server, status } = serverStatus;

  if (serverStatus.statusName === GameStatus.FREE) {
    return createGameInstance( server );
  } else if (
    [ GameStatus.WAITING_FOR_PLAYERS, GameStatus.PREPARING ].includes( serverStatus.statusName ) && status.instance
  ) {
    return GameInstance.findById( status.instance.id );
  }

  throw new Error( 'Unable to create game instance' );
}

/**
 * @param {GameServer} server
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
 * @param {Array<ServerStatus>} statuses
 * @return {Array<ServerStatus>}
 */
function sortAvailableServers (statuses = []) {
  const statusPriority = GameStatusPriority;

  return statuses.sort(
    /**
     * @param {ServerStatus} serverStatusA
     * @param {ServerStatus} serverStatusB
     */
    (serverStatusA, serverStatusB) => {
    if (serverStatusA.statusName === serverStatusB.statusName) {
      return serverStatusB.playersNumber - serverStatusA.playersNumber;
    } else {
      return statusPriority[ serverStatusA.statusName ]
        > statusPriority[ serverStatusB.statusName ]
        ? -1 : 1;
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