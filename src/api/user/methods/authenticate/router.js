import express from 'express';
import {
  facebook, google, guest,
  googleTokenVerifier, facebookTokenVerifier
} from "./providers";

const router = express.Router();

router.post( '/google', [ googleTokenVerifier ], google );
router.post( '/facebook', [ facebookTokenVerifier ], facebook );
router.post( '/guest', guest );

export {
  router
};