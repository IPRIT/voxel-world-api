import { fetchStatuses } from "./status";
import { GameStatus } from "./utils";

export class ServerStatusObserver {

  /**
   * @type {boolean}
   * @private
   */
  _isObserverActive = false;

  /**
   * @type {number|*}
   * @private
   */
  _observerInterval = null;

  /**
   * @type {number}
   * @private
   */
  _observerIntervalMs = 1000;

  /**
   * @type {Array}
   * @private
   */
  _servers = [];

  /**
   * @type {ServerStatusObserver}
   * @private
   */
  static _instance = null;

  /**
   * @return {ServerStatusObserver}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new ServerStatusObserver() );
  }

  update () {
    return fetchStatuses().then(servers => {
      console.log('servers:', servers.map(server => server.status.status));
      this._servers = servers
    })
  }

  runObserver () {
    this._observerInterval = setInterval(this.update.bind( this ), this._observerIntervalMs);
    this._isObserverActive = true;
  }

  stopObserver () {
    if (this._observerInterval) {
      clearInterval( this._observerInterval );
      this._observerInterval = null;
    }
    this._isObserverActive = false;
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {*[]}
   */
  getServers ({ region, gameType } = {}) {
    return this._servers.filter(({ server }) => {
      if (region && gameType) {
        return server.region === region
          && server.gameType === gameType;
      } else if (region) {
        return server.region === region;
      } else if (gameType) {
        return server.gameType === gameType;
      }
      return true;
    });
  }

  /**
   * @param {Object} filter
   * @return {*[]}
   */
  getAvailableServers (filter = {}) {
    return this.getServers( filter ).filter(({ server, status }) => {
      return [
        GameStatus.FREE,
        GameStatus.WAITING_FOR_PLAYERS,
        GameStatus.PREPARING
      ].includes( status.status );
    });
  }

  /**
   * @param {Object} filter
   * @param {number} playersNumber
   * @return {{server: *, status: *}[] | *[]}
   */
  getFitServersForPlayers (filter = {}, playersNumber = 1) {
    return this.getAvailableServers( filter ).filter(({ server, status }) => {
      return status.playersNumber + playersNumber <= status.maxPlayersNumber;
    });
  }

  /**
   * @return {boolean}
   */
  get isObserverActive () {
    return this._isObserverActive;
  }

  /**
   * @return {Array<Object>}
   */
  get servers () {
    return this._servers;
  }
}