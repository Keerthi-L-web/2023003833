const Log = require('logging-middleware');

/**
 * Centralized Express error handling middleware.
 * Captures all uncaught errors, forwards them to the logging service, and formats a clean client response.
 */
async function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Format failure context message
  const failureContext = `Error handling ${req.method} ${req.originalUrl} [Status: ${statusCode}] - ${message}`;

  // Log error with complete stack trace to the evaluation service
  try {
    await Log(err.stack, 'ERROR', 'vehicle_maintenance_scheduler', failureContext);
  } catch (logError) {
    console.error('[Error-Middleware] Centralized logger could not record exception:', logError.message);
  }

  // Send consistent, secure response to client (hiding stack traces in production)
  res.status(statusCode).json({
    status: 'error',
    error: {
      message: message,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

module.exports = errorHandler;
