import { ServerStatus } from "./server-status";
import { GameStatus } from "./utils";
import Promise from "bluebird";
import { GameServer } from "../../models/GameServer";
import Cache from 'cache';

const SERVERS_CACHE_KEY = object => {
  let prefix = `cache:servers`;
  return [ prefix ].concat(
    Object.keys( object ).sort().map(key => {
      return `${key}=${object[ key ]}`;
    }).join( '&' )
  ).join( '?' );
};

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
   * @type {Array<ServerStatus>}
   * @private
   */
  _statuses = [];

  /**
   * @type {Cache}
   * @private
   */
  _serversCache = new Cache( 10 * 1000 );

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

  /**
   * @return {Promise<Array<ServerStatus>>}
   */
  update () {
    return Promise.try(_ => {
      return this.fetchServers();
    }).then(servers => {
      return this._checkServers( servers );
    }).filter(serverStatus => {
      return !serverStatus.isUpdating;
    }).map(
      /**
       * @param {ServerStatus} serverStatus
       * @return {Promise<ServerStatus>}
       */
      serverStatus => {
      return serverStatus.update();
    }).tap(_ => this._logStatuses());
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
   * @param {*} params
   * @return {Promise<GameServer[]>}
   */
  async fetchServers (params = {}) {
    let {
      region = 'all',
      gameType = 'all',
      ignoreCache = false
    } = params;

    let whereStatement = {
      isTemporarilyDown: false
    };
    if (region !== 'all') {
      Object.assign(whereStatement, { region });
    }
    if (gameType !== 'all') {
      Object.assign(whereStatement, { gameType });
    }

    const cachedServers = this._serversCache.get( SERVERS_CACHE_KEY( whereStatement ) );
    if (cachedServers && !ignoreCache) {
      return cachedServers;
    }

    return GameServer.findAll({
      where: whereStatement
    }).map(server => {
      return server.toJSON();
    }).then(servers => {
      this._serversCache.put( SERVERS_CACHE_KEY( whereStatement ), servers );
      return servers;
    });
  }

  /**
   * @param {string} region
   * @param {string} gameType
   * @return {Array<ServerStatus>}
   */
  filterStatuses ({ region, gameType } = {}) {
    return this._statuses.filter(({ server }) => {
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
   * @return {Array<ServerStatus>}
   */
  getAvailableServers (filter = {}) {
    return this.filterStatuses( filter ).filter(serverStatus => {
      return !serverStatus.isLocked
        && serverStatus.status
        && [
          GameStatus.FREE,
          GameStatus.WAITING_FOR_PLAYERS,
          GameStatus.PREPARING
        ].includes( serverStatus.statusName );
    });
  }

  /**
   * @param {Object} filter
   * @param {number} playersNumber
   * @return {Array<ServerStatus>}
   */
  getFitServersForPlayers (filter = {}, playersNumber = 1) {
    return this.getAvailableServers( filter ).filter(status => {
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
   * @return {Array<GameServer>}
   */
  get servers () {
    return this._statuses.map(serverStatus => {
      return serverStatus.server;
    });
  }

  /**
   * @param {Array<GameServer>} servers
   * @return {Array<ServerStatus>}
   * @private
   */
  _checkServers (servers) {
    const statuses = this._statuses;
    const existingServersSet = new Set(
      statuses.map( status => status.serverId )
    );
    const actualServersSet = new Set(
      servers.map( server => server.id )
    );

    statuses.filter(serverStatus => {
      return !actualServersSet.has( serverStatus.serverId );
    }).forEach(status => {
      this._deleteStatus( status );
    });

    servers.filter(server => {
      return !existingServersSet.has( server.id );
    }).forEach(newServer => {
      this._addStatus( newServer );
    });

    return this._statuses;
  }

  /**
   * @param {GameServer} server
   * @return {ServerStatus}
   * @private
   */
  _addStatus (server) {
    const serverStatus = new ServerStatus({ server });
    this._statuses.push( serverStatus );
  }

  /**
   * @param {ServerStatus} status
   * @return {ServerStatus}
   * @private
   */
  _deleteStatus (status) {
    if (!status || !status.server) {
      return null;
    }
    const server = status.server;
    const serverId = server.id;
    const indexToDelete = this._statuses.findIndex(status => {
      return status.serverId === serverId;
    });
    return this._statuses.splice( indexToDelete, 1 )[ 0 ];
  }

  /**
   * @private
   */
  _logStatuses () {
    const playerNumbers = status => [
      status.playersNumber, status.maxPlayersNumber
    ].map(v => Number(v) || 0).join('/');

    console.log(
      `[StatusObserver] Servers:`,
      `\n${this._statuses.map(status => {
        return `[${status.server.name}: ${status.statusName} (${playerNumbers(status)})]`;
      }).join('\n')}`
    );
  }
}