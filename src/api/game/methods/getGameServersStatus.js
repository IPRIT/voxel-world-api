import * as methods from './index';
import { wrapRequest } from "../../../utils";
import { GameServer } from "../../../models/GameServer";
import request from "request-promise";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>|*}
 */
export function getGameServersStatusRequest (req, res, next) {
  return wrapRequest( getGameServersStatus, req, res, next );
}

/**
 * @param {GameServer|Model} server
 * @return {*}
 */
export async function getGameServerStatus (server) {
  // todo: add a little time caching to prevent from spamming game servers
  let statusEndpoint = `http://${server.publicIp}/api/game/status`;

  return {
    playersNumber: 5,
    maxPlayersNumber: 100
  };

  try {
    let response = await request({
      method: 'GET',
      uri: statusEndpoint,
      simple: false,
      json: true,
      resolveWithFullResponse: true,
      followAllRedirects: true
    });
    if (!response.body || ![ 200, 302 ].includes(response.statusCode)) {
      return null;
    }
    return response.body;
  } catch (err) {
    console.error( err );
    return null;
  }
}

/**
 * @param {*} params
 * @return {Promise<{server: *, status: *}>}
 */
export async function getGameServersStatus (params) {
  let {
    region = 'all',
    gameType = 'all'
  } = params;

  let whereStatement = {
    isTemporarilyDown: false
  };
  if (region !== 'all') {
    Object.assign(whereStatement, { region });
  }
  if (gameType !== 'all') {
    Object.assign(whereStatement, { gameType });
  }
  return GameServer.findAll({
    where: whereStatement
  }).map(async server => {
    let serverStatus = await methods.getGameServerStatus( server );
    return {
      server: server.toJSON(),
      status: serverStatus
    }
  });
}