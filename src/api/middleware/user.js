import Promise from 'bluebird';
import { getUserByToken } from "../../utils/models-utils";

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
    user = await getUserByToken( token );
  }

  if (!user) {
    return next();
  }

  req.user = user;

  user.updateRecentActivityTime();
  await user.save();

  next();
}