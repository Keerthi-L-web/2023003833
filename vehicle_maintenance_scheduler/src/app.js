const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables as early as possible
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const schedulerRoutes = require('./routes/scheduler.routes');
const requestLogger = require('./middleware/logging.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// 1. Register security and utility middlewares
app.use(cors());
app.use(express.json());

// 2. Register custom request logging middleware
app.use(requestLogger);

// 3. Register application routes
app.use('/api/scheduler', schedulerRoutes);

// Simple healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 4. Handle 404 (Route Not Found)
app.use((req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// 5. Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
