import express from 'express';
import * as methods from './methods';

const router = express.Router();

// router.use( '/authenticate', user.authenticator );

router.get( '/me', /* [ userRetriever, rightsAllocator('user') ],*/ methods.getMeRequest );

export {
  router
};