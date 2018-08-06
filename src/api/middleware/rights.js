import deap from 'deap';
import { groupUtils } from "../../models/User/groups";
import { ApiError } from "../../utils/error";

export function rightsMiddleware (...groupsArray) {
  let options = {
    public: false
  };
  if (groupsArray.length) {
    let lastObject = groupsArray[ groupsArray.length - 1 ];
    if (typeof lastObject === 'object' && !lastObject.mask) {
      deap.update( options, lastObject );
      groupsArray.pop();
    }
  }
  let defaultGroups = [ 'admin' ];
  let requestedMask = groupUtils.grouping(...defaultGroups, ...groupsArray);

  return (req, res, next) => {
    req.requestedMask = requestedMask;
    req.isPublic = options.public;
    if (options.public && !req.user) {
      return next();
    }
    let loggedInUser = req.user;
    if (!loggedInUser) {
      return next( new ApiError( 'unauthorized', 401 ) );
    } else if (!groupUtils.hasRight( loggedInUser.accessGroup, requestedMask )) {
      return next( new ApiError( 'access_denied', 403 ) );
    }

    next();
  };
}