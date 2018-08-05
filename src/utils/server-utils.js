import { getMe } from "../api/user/methods/getMe";

/**
 *
 * Normalize a port into a number, string, or false.
 *
 * @param {number|*} value
 * @return {number|string|boolean}
 */
export function normalizePort(value) {
  const port = parseInt( value, 10 );
  if (isNaN( port )) {
    // named pipe
    return value;
  }
  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * @param {*} request
 * @return {*}
 */
export function extractAllParams (request) {
  return Object.assign(
    {}, request.body, request.query, request.params, { user: request.user }
  );
}

/**
 * @param {Function} asyncMethodFn
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<T>|*}
 */
export function wrapRequest (asyncMethodFn, req, res, next) {
  const promiseLike = asyncMethodFn( extractAllParams( req ) );
  if (!promiseLike.then) {
    return promiseLike;
  }
  return promiseLike.then(response => {
    return res.json({
      response
    });
  }).catch( next );
}