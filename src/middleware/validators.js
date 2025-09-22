const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Return validation errors
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  };
};

// OAuth validation (no longer needed for marketplace authentication)
// Authentication is now handled through GoHighLevel OAuth flow

// Lead validation for creation
const validateLeadCreate = validate([
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isString().withMessage('First name must be a string'),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string'),
  body('status')
    .optional()
    .isString().withMessage('Status must be a string'),
  body('source')
    .optional()
    .isString().withMessage('Source must be a string'),
  body('customFields')
    .optional()
    .isObject().withMessage('Custom fields must be an object')
]);

// Lead validation for update
const validateLeadUpdate = validate([
  param('id')
    .notEmpty().withMessage('Lead ID is required')
    .isString().withMessage('Lead ID must be a string'),
  body('firstName')
    .optional()
    .isString().withMessage('First name must be a string'),
  body('lastName')
    .optional()
    .isString().withMessage('Last name must be a string'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string'),
  body('status')
    .optional()
    .isString().withMessage('Status must be a string'),
  body('source')
    .optional()
    .isString().withMessage('Source must be a string'),
  body('customFields')
    .optional()
    .isObject().withMessage('Custom fields must be an object')
]);

// List validation for creation
const validateListCreate = validate([
  body('name')
    .notEmpty().withMessage('List name is required')
    .isString().withMessage('List name must be a string'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('type')
    .optional()
    .isString().withMessage('Type must be a string'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
]);

// List validation for update
const validateListUpdate = validate([
  param('id')
    .notEmpty().withMessage('List ID is required')
    .isString().withMessage('List ID must be a string'),
  body('name')
    .optional()
    .isString().withMessage('List name must be a string'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('type')
    .optional()
    .isString().withMessage('Type must be a string'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
]);

module.exports = {
  validateLeadCreate,
  validateLeadUpdate,
  validateListCreate,
  validateListUpdate
};