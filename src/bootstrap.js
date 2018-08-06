/**
 * Module dependencies.
 */
import app from './app';
import http from 'http';

// import socketIo from 'socket.io';
// import * as sockets from './socket';


import { config } from "../config";
import { normalizePort } from "./utils/server-utils";
import { makeRelations } from "./models/relations";

// sync models schemas
makeRelations();

/**
 * Get port from config and set in Express.
 */
let port = normalizePort( config.port );
app.set( 'port', port );
app.set( 'env', process.env.NODE_ENV );

/**
 * Create HTTP server.
 */

let server = http.createServer( app );
// const io = require('socket.io')(server);
// sockets.initialize( io );

// io.on('connection', sockets.subscribeEvents);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(
  ...[ port, config.ip ].filter(v => !!v)
);

server.on( 'error', onError );
server.on( 'listening', onListening );

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch ( error.code ) {
    case 'EACCES':
      console.error( bind + ' requires elevated privileges' );
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error( bind + ' is already in use' );
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;

  console.log(
    `Listening on ${bind} [in ${process.env.NODE_ENV || 'development (default)'} mode].`
  );
}