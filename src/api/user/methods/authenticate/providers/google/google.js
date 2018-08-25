import { generateTokenForUser } from "../../../../../../utils/index";
import { User } from "../../../../../../models/index";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<AuthToken>}
 */
export function google (req, res, next) {
  let googleUser = req.googleUser;

  return getOrCreateUser( googleUser ).then(user => {
    return generateTokenForUser( user );
  }).then(tokenInstance => {
    res.json({
      response: {
        token: tokenInstance.token
      }
    });
  }).catch( next );
}

/**
 * @param {*} googleUser
 * @return {Promise<Model>}
 */
function getOrCreateUser(googleUser) {
  let { sub, email } = googleUser;

  return User.findOne({
    where: {
      $or: {
        email,
        googleId: sub
      }
    }
  }).then(async user => {
    if (!user) {
      return createUser( googleUser );
    }
    return user;
  }).then(user => {
    if (!user.googleId) {
      user.googleId = sub;
    }
    user.updateLastLoggedTime();
    return user.save();
  }).tap(user => {
    console.log( 'Signed in as:', user && user.toJSON().email );
  });
}

/**
 * @param {string} sub
 * @param {string} email
 * @param {string} name
 * @return {User}
 */
function createUser({ sub, email, name }) {
  console.log( '[Google] Creating user...:', email );
  return User.create({
    email,
    googleId: sub,
    displayName: name
  });
}