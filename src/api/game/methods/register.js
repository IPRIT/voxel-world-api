import * as methods from './index';
import { generateCryptoToken, wrapRequest, ApiError } from "../../../utils";
import { User } from "../../../models/User";
import { GameSession } from "../../../models/GameSession";
import { GameServer } from "../../../models/GameServer";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>|*}
 */
export function registerRequest (req, res, next) {
  return wrapRequest( register, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<GameSession>}
 */
export async function register (params) {
  let {
    user, userId,
    region = 'eu-west',
    userNickname,
    gameType = 'quick'
  } = params;

  if (!user && userId) {
    user = await User.findByPrimary( userId );
  }
  let userType = user ? 'user' : 'anonymous';

  let receivedServer = await methods.getFreeGameServer({
    gameType, region
  });
  if (!receivedServer) {
    throw new ApiError( 'servers_are_full' );
  }

  let gameSession = await GameSession.create({
    userType,
    userNickname,
    gameType,
    gameToken: await generateCryptoToken(),
    userId: user && user.id,
    serverId: receivedServer.server.id
  });

  return GameSession.findByPrimary(gameSession.id, {
    include: [ GameServer, User ]
  }).then(session => {
    return session && session.toJSON();
  }).then(session => {
    return Object.assign(session, { serverStatus: receivedServer.status })
  });
}