import Sequelize from 'sequelize';
import { generateTokenForUser } from "../../../../../../utils/index";
import { User } from "../../../../../../models/User/index";

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<AuthToken>}
 */
export function facebook (req, res, next) {
  let facebookUser = req.facebookUser;

  return getOrCreateUser( facebookUser ).then(user => {
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
 * @param {*} facebookUser
 * @return {Promise<User>}
 */
function getOrCreateUser (facebookUser) {
  let { id, email } = facebookUser;

  return User.findOne({
    where: {
      [Sequelize.Op.or]: {
        email,
        facebookId: id
      }
    }
  }).then(async user => {
    if (!user) {
      return createUser( facebookUser );
    }
    return user;
  }).then(user => {
    if (!user.facebookId) {
      user.facebookId = id;
    }
    user.updateLastLoggedTime();
    return user.save();
  }).tap(user => {
    console.log( '[Facebook] Signed in as:', user && user.toJSON().email );
  });
}

/**
 * @param {number} id
 * @param {string} email
 * @param {string} name
 * @return {User}
 */
function createUser({ id, email, name }) {
  console.log( '[Facebook] Creating user...:', email );
  return User.create({
    email,
    facebookId: id,
    displayName: name
  });
}