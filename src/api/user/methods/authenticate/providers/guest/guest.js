import { generateTokenForUser } from "../../../../../../utils/index";
import { User } from "../../../../../../models/index";
import { extractAllParams } from "../../../../../../utils";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<AuthToken>}
 */
export function guest (req, res, next) {
  return getOrCreateUser(
    extractAllParams( req )
  ).then( generateTokenForUser ).then(tokenInstance => {
    res.json({
      response: {
        token: tokenInstance.token
      }
    });
  }).catch( next );
}

/**
 * @param {*} params
 * @return {Promise<Model>}
 */
function getOrCreateUser(params) {
  let { userNickname } = params;

  return createUser( { userNickname } ).tap(user => {
    console.log( 'Signed in as [guest]:', user && user.toJSON().nickname );
  });
}

/**
 * @param {string} userNickname
 * @return {User}
 */
function createUser({ userNickname }) {
  userNickname = (userNickname || '').toString().trim();
  console.log( '[Guest] Creating user...:', userNickname );
  return User.create({
    nickname: userNickname,
    displayName: 'Guest'
  });
}