const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header is missing' });
    }
    
    // Check if token format is valid
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, message: 'Invalid authorization format. Format is "Bearer <token>"' });
    }
    
    const token = parts[1];
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Token has expired', code: 'token_expired' });
        }
        
        return res.status(401).json({ success: false, message: 'Invalid token', code: 'invalid_token' });
      }
      
      // Add user data to request object with GoHighLevel marketplace structure
      req.user = {
        // GoHighLevel access token for API calls
        ghlAccessToken: decoded.ghlAccessToken,
        ghlRefreshToken: decoded.ghlRefreshToken,
        locationId: decoded.locationId,
        scope: decoded.scope,
        tokenExpiry: decoded.tokenExpiry,
        // For backward compatibility, map ghlAccessToken to apiKey
        apiKey: decoded.ghlAccessToken,
        ghlLocationId: decoded.locationId
      };
      next();
    });
  } catch (error) {
    logger.error('Error in authenticate middleware:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = {
  authenticate
};