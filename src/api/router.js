import express from 'express';
import bodyParser from 'body-parser';
import cors from './cors';
import { router as userRouter } from "./user";
import { router as gameRouter } from "./game";
import { router as testRouter } from "./test";

const router = express.Router();

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: false }) );

router.all( '*', cors );

router.use( '/user', userRouter );
router.use( '/game', gameRouter );
router.use( '/test', testRouter );

export {
  router
};