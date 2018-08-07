import express from 'express';
import * as methods from './methods';
import { rightsMiddleware, userMiddleware } from "../middleware";

const router = express.Router();

router.post('/register', [ userMiddleware, rightsMiddleware('user', { public: true }) ], methods.registerRequest);
router.get('/register', [ userMiddleware, rightsMiddleware('user', { public: true }) ], methods.registerRequest);

router.get('/servers', [ userMiddleware, rightsMiddleware('user', { public: true }) ], methods.getGameServersStatusRequest);
router.get('/servers/free', [ userMiddleware, rightsMiddleware('user', { public: true }) ], methods.getFreeGameServerRequest);

// internal communication
router.get('/session/:gameToken', methods.getGameSessionRequest);

export {
  router
};