import verifier from 'google-id-token-verifier';
import Promise from 'bluebird';
import deap from 'deap';
import { config } from "../../../../../../../config";
import { ApiError } from "../../../../../../utils";

/**
 * @param {*} obj
 * @return {boolean}
 */
function isGoogleUserLike (obj) {
  let threeWhales = [ 'sub', 'email', 'name' ];
  return threeWhales.every(whale => obj && obj.hasOwnProperty(whale));
}

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 */
export function googleTokenVerifier (req, res, next) {
  let { accessToken = '' } = req.body;
  let { clientId } = config.google;

  return Promise.promisify(verifier.verify)(accessToken, clientId).then(googleUser => {
    if (!isGoogleUserLike( googleUser )) {
      throw new ApiError( 'authentication_failed' );
    }
    deap.merge(req, { googleUser });
    next();
  }).catch( next );
}