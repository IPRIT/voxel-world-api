import fb from 'facebook-node';
import deap from 'deap';
import { ApiError } from "../../../../../../utils";

/**
 * @param {*} obj
 * @return {boolean}
 */
function isFacebookUserLike (obj) {
  let threeWhales = [ 'id', 'email', 'name' ];
  return threeWhales.every(whale => obj && obj.hasOwnProperty(whale));
}

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 */
export function facebookTokenVerifier (req, res, next) {
  let accessToken = req.body.accessToken;

  // bluebird's promisify function works incorrectly for the `fb.api`
  fb.api('me', { fields: ['id', 'name', 'email'], access_token: accessToken }, facebookUser => {
    if (!isFacebookUserLike( facebookUser )) {
      return next(new ApiError( 'authentication_failed' ));
    }
    deap.merge(req, { facebookUser });
    next();
  });
}