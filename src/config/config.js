/**
 * Configuration module for loading environment variables
 */
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-for-development',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-development',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  
  // API configuration
  api: {
    nextiva: {
      baseUrl: process.env.NEXTIVA_API_BASE_URL || 'https://api.nextiva.com',
      timeout: parseInt(process.env.API_TIMEOUT) || 30000
    },
    thrio: {
      baseUrl: process.env.THRIO_API_BASE_URL || 'https://login.thrio.com',
      tokenEndpoint: process.env.THRIO_TOKEN_ENDPOINT || '/provider/token-with-authorities',
      timeout: parseInt(process.env.API_TIMEOUT) || 30000
    },
    ghl: {
      baseUrl: process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com',
      // OAuth configuration removed - using marketplace app installation instead
      // Authentication will be handled through GoHighLevel marketplace
      // Username/password stored in GoHighLevel and retrieved via API
    }
  },
  
  // CORS configuration
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;