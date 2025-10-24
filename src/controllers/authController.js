const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config/config');
const { goHighLevelService } = require('../services/goHighLevelService');
const { nextivaCrmService } = require('../services/nextivaCrmService');
const { storeThrioCredentials, getThrioCredentials, validateAppInstallation } = require('../services/goHighLevelService');

/**
 * Install app for GoHighLevel location - stores Thrio credentials
 * This endpoint is called during the GoHighLevel marketplace app installation
 */
const installApp = async (req, res) => {
  try {
    const { locationId, username, password, apiKey } = req.body;

    // Validate required fields
    if (!locationId || !username || !password || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: locationId, username, password, apiKey'
      });
    }

    // First, validate the Thrio credentials
    const thrioValidation = await nextivaCrmService.validateCredentials(username, password);
    
    if (!thrioValidation.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Thrio credentials',
        error: thrioValidation.message
      });
    }

    // Store the credentials in GoHighLevel
    const storageResult = await storeThrioCredentials(locationId, username, password, apiKey);
    
    if (!storageResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to store credentials',
        error: storageResult.message
      });
    }

    logger.info('App installed successfully', { locationId, username });

    res.json({
      success: true,
      message: 'App installed successfully',
      data: {
        locationId,
        username,
        installedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('App installation failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'App installation failed',
      error: error.message
    });
  }
};

/**
 * Validate external authentication (for GoHighLevel marketplace)
 * This endpoint validates credentials and returns a JWT token
 * Supports both direct credentials and GoHighLevel credential fetching
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateAuth = async (req, res) => {
  try {
    const { username, password, locationId, apiKey } = req.body;

    let credentials = { username, password };

    // If locationId and apiKey are provided, try to get stored credentials
    if (locationId && apiKey && !username && !password) {
      const storedCredentials = await getThrioCredentials(locationId, apiKey);
      
      if (!storedCredentials.success) {
        return res.status(404).json({
          success: false,
          message: 'No stored credentials found for this location. Please install the app first.',
          requiresInstallation: true
        });
      }
      
      credentials = storedCredentials.credentials;
    }

    // Validate required fields for direct authentication
    if (!credentials.username || !credentials.password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Validate credentials against Thrio
    const thrioValidation = await nextivaCrmService.validateCredentials(
      credentials.username,
      credentials.password
    );

    if (!thrioValidation.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        details: thrioValidation.message
      });
    }

    // Generate JWT token
    const tokenPayload = {
      username: credentials.username,
      locationId: locationId || null,
      type: locationId ? 'ghl_marketplace' : 'direct',
      validated_at: new Date().toISOString()
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(
      { username: credentials.username },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    logger.info('Authentication successful', { 
      username: credentials.username,
      locationId: locationId || 'direct'
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        access_token: token,
        refresh_token: refreshToken,
        expires_in: config.jwt.expiresIn,
        token_type: 'Bearer',
        user: {
          username: credentials.username,
          locationId: locationId || null,
          type: locationId ? 'ghl_marketplace' : 'direct'
        }
      }
    });

  } catch (error) {
    logger.error('Error in validateAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          username: decoded.username,
          ghl_location_id: decoded.ghl_location_id,
          validated_at: decoded.validated_at,
          expires_at: new Date(decoded.exp * 1000).toISOString()
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    logger.error('Error in verifyToken:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

/**
 * Refresh JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      const decoded = jwt.verify(refresh_token, config.jwt.refreshSecret);
      
      // Generate new access token
      const newTokenPayload = {
        username: decoded.username,
        ghl_location_id: decoded.ghl_location_id || null,
        validated_at: new Date().toISOString()
      };

      const newToken = jwt.sign(newTokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newToken,
          expires_in: config.jwt.expiresIn,
          token_type: 'Bearer'
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

  } catch (error) {
    logger.error('Error in refreshToken:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

module.exports = {
  validateAuth,
  verifyToken,
  refreshToken,
  healthCheck
};