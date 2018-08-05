import express from 'express';
import bodyParser from 'body-parser';
import cors from './cors';
import { router as userRouter } from "./user";

const router = express.Router();

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: false }) );

router.all( '*', cors );

router.use( '/user', userRouter );

export {
  router
};