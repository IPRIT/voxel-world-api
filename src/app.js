/**
 * Setting up a global http error for handle API errors
 */
import { ApiError } from "./utils/error/api-error";
global.HttpError = ApiError;

import express from 'express';
import morgan from 'morgan';

import { clientError, serverError } from "./utils/error/middleware";
import { router as apiRouter } from "./api";

let app = express();

app.use( morgan('tiny') );
app.enable( 'trust proxy' );

app.use( '/api', apiRouter );

app.use( clientError );
app.use( serverError );

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new ApiError( 'endpoint_not_found', 404 );
  res.status( error.httpCode ).json({
    error: error.plainError
  });
  next( error );
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    res.status( err.status || 500 );
    console.error( err );
    res.end();
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status( err.status || 500 );
  res.end();
});

export default app;