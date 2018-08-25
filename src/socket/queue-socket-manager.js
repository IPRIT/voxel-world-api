import Socket from 'socket.io';
import { config } from "../../config";
import { validateToken } from "../utils/models-utils";
import { extractSocketQuery } from "../utils";

export class QueueSocketManager {

  /**
   * @type {*}
   * @private
   */
  _io = null;

  /**
   * @type {QueueSocketManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {QueueSocketManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new QueueSocketManager() );
  }

  /**
   * @param {Server} server
   */
  initialize (server) {
    this._io = Socket( server, config.socket.options );
    this._io.use( this._validateToken.bind( this ) );
    this._io.on( 'connection', this._onConnection.bind( this ) );
  }

  /**
   * @return {boolean}
   */
  get isInitialized () {
    return !!this._io;
  }

  /**
   * @param {Object} handshake
   * @param {Function} next
   * @private
   */
  _validateToken ({ handshake = {} }, next) {
    const { query = {} } = handshake;
    const { authToken } = query;

    return validateToken( authToken )
      .then( next )
      .catch( next );
  }

  /**
   * @param {Socket} socket
   * @private
   */
  _onConnection (socket) {
    const query = extractSocketQuery( socket );
    const defaultNickname = 'Unknown player';

    let { nickname = 'Unknown player' } = query;
    if (!nickname) {
      nickname = defaultNickname;
    }
    console.log( `[Queue#connection] "${nickname}" joined the queue.` );
  }
}