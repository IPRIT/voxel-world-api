import Socket from 'socket.io';
import { config } from "../../../config";
import { getUserByToken, validateToken } from "../../utils/models-utils";
import { extractSocketQuery } from "../../utils/index";
import { Queue } from "./queue";
import { Player } from "../player";
import * as superheroes from "superheroes";

export class QueueManager {

  /**
   * @type {Map<string, Queue>}
   * @private
   */
  _queuesMap = new Map();

  /**
   * @type {*}
   * @private
   */
  _io = null;

  /**
   * @type {QueueManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {QueueManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new QueueManager() );
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
   * @param {string} region
   * @param {string} gameType
   * @return {Queue}
   */
  _resolveQueue (region, gameType) {
    if (!this._hasQueue( region, gameType )) {
      this._initQueue( region, gameType );
    }
    return this._getQueue( region, gameType );
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {Queue}
   * @private
   */
  _initQueue (region, gameType) {
    const queue = new Queue({ region, gameType });
    queue.tick();
    this._queuesMap.set(
      this._buildQueueKey( region, gameType ),
      queue
    );
    return queue;
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {Queue}
   * @private
   */
  _getQueue (region, gameType) {
    return this._queuesMap.get(
      this._buildQueueKey( region, gameType )
    );
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {boolean}
   * @private
   */
  _hasQueue (region, gameType) {
    return this._queuesMap.has(
      this._buildQueueKey( region, gameType )
    );
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {string}
   * @private
   */
  _buildQueueKey (region, gameType) {
    return `${region}:${gameType}`;
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
    const params = extractSocketQuery( socket );
    const defaultNickname = superheroes.random();

    let { nickname = defaultNickname } = params;
    if (!nickname) {
      params.nickname = defaultNickname;
    }

    return this._fetchUser( params.authToken ).then(user => {
      return this._updateUser( user, params );
    }).then(user => {
      return new Player( socket, user );
    }).then(player => {
      return this._addToQueue( player, params );
    });
  }

  /**
   * @param {string} authToken
   * @return {Promise<User>}
   * @private
   */
  _fetchUser (authToken) {
    return getUserByToken( authToken );
  }

  /**
   * @param {User} user
   * @param {Object} params
   * @return {Promise<User>}
   * @private
   */
  async _updateUser (user, params = {}) {
    let {
      nickname
    } = params;

    return user.update({
      nickname
    });
  }

  /**
   * @param {Player} player
   * @param {Object} params
   * @private
   */
  _addToQueue (player, params) {
    const {
      region,
      gameType
    } = params;

    const queue = this._resolveQueue( region, gameType );
    this._attachEvents( player, queue );
    return queue.addToQueue( player );
  }

  /**
   * @param {Player} player
   * @param {Queue} queue
   * @private
   */
  _attachEvents (player, queue) {
    const { socket } = player;

    socket.once('disconnect', _ => {
      queue.removeFromQueueByUserId( player.id );
    });
  }
}