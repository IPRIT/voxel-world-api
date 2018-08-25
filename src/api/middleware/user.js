import Promise from 'bluebird';
import { AuthToken, User } from "../../models";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<*>}
 */
export async function userMiddleware (req, res, next) {
  return Promise.resolve().then(() => {
    return retrieveUser( req, res, next );
  }).catch( next );
}

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<*>}
 */
async function retrieveUser(req, res, next) {
  req._ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || req.headers['x-real-ip']
    || 'Not specified';

  let {
    token = req.header('X-Token') || req.query.token || req.body.token
  } = req.params;

  req.token = token;
  let user;

  if (typeof token === 'string') {
    user = await getUser( token );
  }

  if (!user) {
    return next();
  }

  req.user = user;

  user.updateRecentActivityTime();
  await user.save();

  next();
}

/**
 * @param {string} token
 * @return {Promise<User>}
 */
async function getUser(token) {
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