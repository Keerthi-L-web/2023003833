const app = require('./app');
const Log = require('logging-middleware');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  const startupMessage = `Server successfully started and listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`;
  
  // Ship a startup log to the evaluation service logging API
  try {
    await Log(null, 'INFO', 'vehicle_maintenance_scheduler', startupMessage);
  } catch (error) {
    console.error('[Server-Startup] Failed to ship startup log:', error.message);
  }
});

// Implement graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});