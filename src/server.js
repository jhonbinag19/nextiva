/**
 * Server entry point
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const corsConfig = require('./config/corsConfig');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors(corsConfig)); // CORS configuration
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // HTTP request logging

// Apply routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server if not in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });
} else {
  logger.info('Server running in serverless mode');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production
  if (config.nodeEnv === 'development') {
    process.exit(1);
  }
});

module.exports = app; // Export for testing