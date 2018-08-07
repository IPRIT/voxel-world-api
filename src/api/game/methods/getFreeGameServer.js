import { wrapRequest } from "../../../utils";
import { GameServer } from "../../../models/GameServer";
import { ApiError } from "../../../utils/error";
import { getGameServerStatus } from "./getGameServersStatus";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>|*}
 */
export function getFreeGameServerRequest (req, res, next) {
  return wrapRequest( getFreeGameServer, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<{server: *, status}>}
 */
export async function getFreeGameServer (params) {
  let {
    region = 'eu-west',
    gameType = 'quick'
  } = params;

  const servers = await GameServer.findAll({
    where: {
      region,
      gameType,
      isTemporarilyDown: false
    }
  });
  if (!servers.length) {
    throw new ApiError( 'servers_unavailable' );
  }
  // todo: maybe we need another algorithm to find optimal server?
  return findFirstAvailableGameServer( servers );
}

/**
 * @param {GameServer[]|Model[]} servers
 * @return {Promise<{server: *, status}>}
 */
export async function findFirstAvailableGameServer (servers) {
  let gameServerFound = false;
  let serverIndex = 0;

  while (!gameServerFound && serverIndex < servers.length) {
    let server = servers[ serverIndex++ ];
    let serverStatus = await getGameServerStatus( server );
    if (!serverStatus) {
      continue;
    }
    if (serverStatus.playersNumber < serverStatus.maxPlayersNumber) {
      gameServerFound = true;
      return {
        server: server.toJSON(),
        status: serverStatus
      };
    }
  }
  throw new ApiError( 'servers_unavailable' );
}