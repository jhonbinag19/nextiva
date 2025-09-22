const jwt = require('jsonwebtoken');
const axios = require('axios');
const { logger } = require('../utils/logger');
const config = require('../config/config');
const { goHighLevelService } = require('../services/goHighLevelService');

/**
 * Initiate GoHighLevel OAuth flow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initiateOAuth = (req, res) => {
  try {
    const { clientId, oauthUrl, redirectUri } = config.api.ghl;
    
    if (!clientId || !redirectUri) {
      return res.status(500).json({
        success: false,
        message: 'OAuth configuration missing. Please check GHL_CLIENT_ID and GHL_REDIRECT_URI environment variables.'
      });
    }
    
    // Required scopes for marketplace app
    const scopes = [
      'contacts.readonly',
      'contacts.write',
      'locations.readonly',
      'users.readonly'
    ].join(' ');
    
    const authUrl = `${oauthUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    res.status(200).json({
      success: true,
      authUrl,
      message: 'Redirect user to this URL to complete OAuth flow'
    });
  } catch (error) {
    logger.error('Error in initiateOAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth flow'
    });
  }
};

/**
 * Handle OAuth callback and exchange code for token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleOAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }
    
    const { clientId, clientSecret, tokenUrl, redirectUri } = config.api.ghl;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'OAuth configuration missing'
      });
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      tokenUrl,
      {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token, expires_in, scope } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(401).json({
        success: false,
        message: 'Failed to obtain access token'
      });
    }
    
    // Validate the token by making a test API call
    const validationResult = await goHighLevelService.validateApiKey(access_token);
    
    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token received'
      });
    }
    
    // Generate JWT token for our API
    const jwtToken = jwt.sign(
      {
        ghlAccessToken: access_token,
        ghlRefreshToken: refresh_token,
        locationId: validationResult.locationId,
        scope: scope,
        tokenExpiry: Date.now() + (expires_in * 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate refresh token for our API
    const apiRefreshToken = jwt.sign(
      {
        ghlRefreshToken: refresh_token,
        locationId: validationResult.locationId
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      token: jwtToken,
      refreshToken: apiRefreshToken,
      expiresIn: 86400, // 24 hours in seconds
      tokenType: 'Bearer',
      location: {
        id: validationResult.locationId,
        name: validationResult.locationName
      },
      scope: scope
    });
  } catch (error) {
    logger.error('Error in handleOAuthCallback:', error);
    
    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization code'
      });
    }
    
    next(error);
  }
};

/**
 * Verify authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyToken = (req, res) => {
  // If request reaches here, token is valid (verified by authenticate middleware)
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
};

/**
 * Refresh authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }
      
      const { username, userId } = decoded;
      
      // Generate new JWT token
      const newToken = jwt.sign(
        { 
          username,
          userId
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        success: true,
        token: newToken,
        expiresIn: 86400, // 24 hours in seconds
        tokenType: 'Bearer'
      });
    });
  } catch (error) {
    logger.error('Error in refreshToken:', error);
    next(error);
  }
};

/**
 * Validate external authentication credentials for GoHighLevel marketplace
 * This endpoint is called by GoHighLevel to validate user credentials during app installation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateExternalAuth = async (req, res) => {
  try {
    const { username, password, apiKey } = req.body;
    
    // Log the validation attempt (without sensitive data)
    logger.info('External authentication validation attempt', {
      username: username ? username.substring(0, 3) + '***' : undefined,
      hasPassword: !!password,
      hasApiKey: !!apiKey
    });
    
    // Validate required credentials
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }
    
    // Here you would typically validate against your user database
    // For now, we'll implement a basic validation logic
    // In a real implementation, you would:
    // 1. Hash the password and compare with stored hash
    // 2. Check user exists and is active
    // 3. Validate any additional business rules
    
    // Example validation (replace with your actual validation logic)
    const isValidUser = await validateUserCredentials(username, password);
    
    if (!isValidUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        error: 'INVALID_CREDENTIALS'
      });
    }
    
    // Return success response for GoHighLevel
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        username: username,
        authenticated: true,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error in validateExternalAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Helper function to validate user credentials
 * Replace this with your actual user validation logic
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {boolean} - Whether credentials are valid
 */
const validateUserCredentials = async (username, password) => {
  // TODO: Implement actual user validation logic
  // This is a placeholder implementation
  
  // Example: Check against environment variables for demo purposes
  const validUsername = process.env.DEMO_USERNAME || 'admin';
  const validPassword = process.env.DEMO_PASSWORD || 'password123';
  
  return username === validUsername && password === validPassword;
};

module.exports = {
  initiateOAuth,
  handleOAuthCallback,
  verifyToken,
  refreshToken,
  validateExternalAuth
};