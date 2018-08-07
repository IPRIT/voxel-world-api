const errorTypes = new Map([
  [ 'unknown_error', 'Unknown error' ],
  [ 'unauthorized', 'Authorization needed' ],
  [ 'access_denied', 'You have no permissions' ],
  [ 'bad_request', 'Bad Request' ],
  [ 'endpoint_not_found', 'Endpoint not found' ],
  [ 'authentication_failed', 'Authentication token has been rejected' ],
  [ 'servers_are_full', 'All servers are full in this region' ],
  [ 'servers_unavailable', 'All servers unavailable in this region' ],
  [ 'invalid_game_session', 'Game session not found or not valid' ],
]);

export { errorTypes };