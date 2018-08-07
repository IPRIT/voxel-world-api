const errorTypes = new Map([
  [ 'unknown_error', 'Unknown error' ],
  [ 'unauthorized', 'Authorization needed' ],
  [ 'access_denied', 'You have no permissions' ],
  [ 'bad_request', 'Bad Request' ],
  [ 'endpoint_not_found', 'Endpoint not found' ],
  [ 'authentication_failed', 'Authentication token has been rejected' ],
]);

export { errorTypes };