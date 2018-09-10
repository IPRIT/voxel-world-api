import { GameStatus, getServerUnavailableError, getStatusUrl } from "./utils";
import request from "request-promise";
import { ApiError } from "../../utils/error";
import Promise from 'bluebird';

export class ServerStatus {

  /**
   * @type {GameServer}
   * @private
   */
  _server = null;

  /**
   * @type {Object}
   * @private
   */
  _status = null;

  /**
   * @type {number}
   * @private
   */
  _lockedToMs = 0;

  /**
   * @type {boolean}
   * @private
   */
  _isUpdating = false;

  /**
   * @param {GameServer} server
   * @param {Object?} status
   */
  constructor ({ server, status = null } = {}) {
    this._server = server;
    this._status = status;
  }

  /**
   * @return {Promise<ServerStatus>}
   */
  update () {
    this._isUpdating = true;
    return this._fetchStatus().then(status => {
      this._status = status;
      return this;
    }).finally(_ => {
      this._isUpdating = false;
    });
  }

  /**
   * @param {GameServer} server
   */
  setServer (server) {
    this._server = server;
  }

  /**
   * Locking any following searches until time is over
   */
  lock (lockTimeMs = 10000) {
    this._lockedToMs = Date.now() + lockTimeMs;
  }

  /**
   * @return {GameServer}
   */
  get server () {
    return this._server;
  }

  /**
   * @return {number}
   */
  get serverId () {
    return this._server && this._server.id;
  }

  /**
   * @return {Object}
   */
  get status () {
    return this._status;
  }

  /**
   * @return {string}
   */
  get statusName () {
    return this._status && this._status.status
      || GameStatus.UNAVAILABLE;
  }

  /**
   * @return {number}
   */
  get playersNumber () {
    return this._status && this._status.playersNumber;
  }

  /**
   * @return {number}
   */
  get maxPlayersNumber () {
    return this._status && this._status.maxPlayersNumber;
  }

  /**
   * @return {boolean}
   */
  get isLocked () {
    return this._lockedToMs > Date.now();
  }

  /**
   * @return {boolean}
   */
  get isUpdating () {
    return this._isUpdating;
  }

  /**
   * @return {Promise<Object>}
   * @private
   */
  async _fetchStatus () {
    const server = this._server;
    const statusUrl = getStatusUrl( server );
    const serverUnavailable = getServerUnavailableError( server );

    try {
      let response = await request({
        method: 'GET',
        uri: statusUrl,
        simple: false,
        json: true,
        resolveWithFullResponse: true,
        followAllRedirects: true
      });

      if (!response.body || ![ 200, 302 ].includes(response.statusCode)) {
        throw new ApiError();
      }

      return response.body.response;
    } catch (err) {
      return serverUnavailable;
    }
  }
}