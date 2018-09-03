/**
 * @param {GameServer} server
 * @return {string}
 */
export function getStatusUrl (server) {
  return `http://${server.publicIp}/api/game/status`;
}

/**
 * @param {GameServer} server
 * @return {{status: string, publicIp: (GameServer.publicIp|{type})}}
 */
export function getServerUnavailableError (server) {
  return {
    status: 'unavailable',
    publicIp: server.publicIp
  };
}

/**
 * @type {{FREE: string, WAITING_FOR_PLAYERS: string, PREPARING: string, IN_GAME: string, UNAVAILABLE: string}}
 */
export const GameStatus = {
  FREE: 'free',
  WAITING_FOR_PLAYERS: 'waiting-for-players',
  PREPARING: 'preparing',
  IN_GAME: 'in-game',
  UNAVAILABLE: 'unavailable'
};