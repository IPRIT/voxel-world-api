import { wrapRequest } from "../../../utils";
import { ApiError } from "../../../utils/error";
import { GameSession, GameInstance, User } from "../../../models";

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
    sessionToken
  } = params;

  if (!sessionToken) {
    throw new ApiError( 'bad_request' );
  }

  let gameSession = await GameSession.findOne({
    where: {
      sessionToken
    },
    include: [ GameInstance, User ]
  });

  if (!gameSession) {
    throw new ApiError( 'invalid_game_session', 400 );
  }

  return gameSession.toJSON();
}