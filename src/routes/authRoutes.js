const express = require('express');
const { validateAuth, verifyToken, refreshToken, healthCheck } = require('../controllers/authController');

const router = express.Router();

// Authentication validation endpoint for GoHighLevel marketplace
router.post('/validate', validateAuth);

// Token verification endpoint
router.post('/verify', verifyToken);

// Token refresh endpoint
router.post('/refresh', refreshToken);

// Health check endpoint
router.get('/health', healthCheck);

module.exports = router;