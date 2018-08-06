const errorTypes = new Map([
  [ 'unknown_error', 'Unknown error' ],
  [ 'unauthorized', 'Authorization needed' ],
  [ 'access_denied', 'You have no permissions' ],
  [ 'bad_request', 'Bad Request' ],
  [ 'endpoint_not_found', 'Endpoint not found' ],
]);

export { errorTypes };