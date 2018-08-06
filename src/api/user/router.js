import express from 'express';
import * as methods from './methods';
import { userMiddleware } from "../middleware/user";
import { rightsMiddleware } from "../middleware/rights";

const router = express.Router();

// router.use( '/authenticate', user.authenticator );

router.get( '/me', [ userMiddleware, rightsMiddleware( 'user' ) ], methods.getMeRequest );

export {
  router
};