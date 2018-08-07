import { wrapRequest } from "../../../utils";
import { ApiError } from "../../../utils/error";
import { GameSession, GameServer, User } from "../../../models";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>|*}
 */
export function getGameSessionRequest (req, res, next) {
  return wrapRequest( getGameSession, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<*>}
 */
export async function getGameSession (params) {
  let {
    gameToken
  } = params;
  if (!gameToken) {
    throw new ApiError( 'bad_request' );
  }
  let gameSession = await GameSession.findOne({
    where: {
      gameToken
    },
    include: [ GameServer, User ]
  });
  if (!gameSession) {
    throw new ApiError( 'invalid_game_session', 400 );
  }
  return gameSession.toJSON();
}