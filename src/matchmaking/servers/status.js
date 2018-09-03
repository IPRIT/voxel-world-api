import Promise from 'bluebird';
import request from "request-promise";
import Cache from 'cache';
import { GameServer } from "../../models/GameServer";
import { getServerUnavailableError, getStatusUrl } from "./utils";

const statusCache = new Cache( 1000 );
const serversCache = new Cache( 10 * 1000 );

const SERVERS_CACHE_KEY = object => {
  let prefix = `cache:servers`;
  return [ prefix ].concat(
    Object.keys( object ).map(key => {
      return `${key}=${object[ key ]}`;
    }).join( '&' )
  ).join( '?' );
};

/**
 * @param {GameServer} server
 * @return {Promise<Object>}
 */
export async function fetchStatus (server) {
  const statusUrl = getStatusUrl( server );
  const serverUnavailable = getServerUnavailableError( server );

  const cachedStatus = statusCache.get( statusUrl );
  if (cachedStatus) {
    return cachedStatus;
  }

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
      throw new Error('Server Unavailable');
    }

    const status = response.body.response;
    statusCache.put( statusUrl, status );
    return status;
  } catch (err) {
    statusCache.put( statusUrl, serverUnavailable );
    return serverUnavailable;
  }
}

/**
 * @param {Object} params
 * @return {Promise<*>}
 */
export async function fetchStatuses (params = {}) {
  return getServers( params ).map(server => {
    return Promise.all([
      server,
      fetchStatus( server )
    ]).spread((server, status) => {
      return { server, status };
    });
  });
}

/**
 * @param {*} params
 * @return {Promise<GameServer[]>}
 */
export async function getServers (params = {}) {
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

  const cachedServers = serversCache.get( SERVERS_CACHE_KEY( whereStatement ) );
  if (cachedServers && !ignoreCache) {
    return cachedServers;
  }

  return GameServer.findAll({
    where: whereStatement
  }).map(server => {
    return server.toJSON();
  }).then(servers => {
    serversCache.put( SERVERS_CACHE_KEY( whereStatement ), servers );
    return servers;
  });
}