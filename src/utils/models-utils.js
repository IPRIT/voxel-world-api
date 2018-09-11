import { AuthToken } from "../models";
import { ApiError } from "./error";
import Promise from 'bluebird';

/**
 * @param {string} token
 * @return {Promise}
 */
export async function validateToken (token) {
  if (!token) {
    throw new Error( 'unauthorized' );
  }

  return AuthToken.findOne({
    where: { token }
  }).then(token => {
    if (!token) {
      throw new Error( 'unauthorized' );
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
      throw new Error( 'user_not_found' );
    } else if (user.isSuspended) {
      throw new Error( 'banned' );
    }
  });
}

/**
 * @param {string} token
 * @return {Promise<User>}
 */
export async function getUserByToken (token) {
  let tokenInstance = await AuthToken.findOne({
    where: { token }
  });
  if (!tokenInstance) {
    return null;
  }
  return tokenInstance.getUser({
    attributes: {
      exclude: [ 'deletedAt' ]
    }
  });
}