import express from 'express';
import * as methods from './methods';
import { router as authRouter } from "./methods/authenticate/router";
import { userMiddleware, rightsMiddleware } from "../middleware";

const router = express.Router();

router.use( '/authenticate', authRouter );

router.get( '/me', [ userMiddleware, rightsMiddleware( 'user' ) ], methods.getMeRequest );

export {
  router
};