import express from 'express';
import { facebook, google, facebookTokenVerifier, googleTokenVerifier } from "./providers";

const router = express.Router();

router.post('/google', [ googleTokenVerifier ], google);
router.post('/facebook', [ facebookTokenVerifier ], facebook);

export {
  router
};