/**
 * @param {GameServer} server
 * @return {string}
 */
export function getStatusUrl (server) {
  return `https://${server.publicIp}/api/game/status`;
}

/**
 * @param {GameServer} server
 * @return {{status: string, publicIp: (GameServer.publicIp|{type})}}
 */
export function getServerUnavailableError (server) {
  return {
    status: GameStatus.UNAVAILABLE,
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
  UNAVAILABLE: 'unavailable',
  FINISHED: 'finished'
};

/**
 * @type {{FREE: number, WAITING_FOR_PLAYERS: number, PREPARING: number}}
 */
export const GameStatusPriority = {
  'free': 1 << 5,
  'waiting-for-players': 1 << 6,
  'preparing': 1 << 7
};
