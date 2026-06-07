const Log = require('logging-middleware');

/**
 * Express middleware to log details of incoming requests.
 */
async function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const message = `${req.method} ${req.originalUrl} - Client IP: ${req.ip || req.headers['x-forwarded-for']}`;

  // Run asynchronously without awaiting so the client response is not delayed
  Log(null, 'INFO', 'vehicle_maintenance_scheduler', message)
    .catch(err => {
      console.error('[RequestLogger-Middleware] Logging failed:', err.message);
    });

  next();
}

module.exports = requestLogger;
