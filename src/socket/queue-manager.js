import Socket from 'socket.io';
import { config } from "../../config";

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
    this._io.on( 'connection', this._onConnection.bind( this ) );
  }

  /**
   * @return {boolean}
   */
  get isInitialized () {
    return !!this._io;
  }

  /**
   * @param {Socket} socket
   * @private
   */
  _onConnection (socket) {
    console.log( '[Socket#connection]', socket.id, 'joined the server.' );
  }
}