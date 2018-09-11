import express from 'express';
import * as methods from './methods';

const router = express.Router();

// internal communication
router.get('/session/:sessionToken', methods.getGameSessionRequest);

export {
  router
};