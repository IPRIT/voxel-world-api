import { AuthToken } from "../models";
import { ApiError } from "./error";
import Promise from 'bluebird';

/**
 * @param {string} token
 * @return {Promise}
 */
export function validateToken (token) {
  if (!token) {
    throw new ApiError( 'unauthorized', 401 );
  }

  return AuthToken.findOne({
    where: { token }
  }).then(token => {
    if (!token) {
      throw new ApiError( 'unauthorized', 401 );
    }
    return Promise.all([
      token,
      token.getUser({
        attributes: {
          exclude: [ 'deletedAt' ]
        }
      })
    ]);
  }).spread((token, user) => {
    if (!user) {
      throw new ApiError( 'user_not_found', 404 );
    } else if (user.isSuspended) {
      throw new ApiError( 'banned', 403 );
    }
  });
}