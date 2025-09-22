/**
 * Create a standardized API error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} errors - Array of specific error details
 * @returns {Error} Standardized error object
 */
const createApiError = (message, statusCode = 500, errors = []) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
};

/**
 * Create a validation error
 * @param {string} message - Error message
 * @param {Array} errors - Array of validation error details
 * @returns {Error} Validation error object
 */
const createValidationError = (message = 'Validation error', errors = []) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

/**
 * Create a not found error
 * @param {string} message - Error message
 * @returns {Error} Not found error object
 */
const createNotFoundError = (message = 'Resource not found') => {
  const error = new Error(message);
  error.name = 'NotFoundError';
  error.statusCode = 404;
  return error;
};

/**
 * Create an unauthorized error
 * @param {string} message - Error message
 * @returns {Error} Unauthorized error object
 */
const createUnauthorizedError = (message = 'Unauthorized') => {
  const error = new Error(message);
  error.name = 'UnauthorizedError';
  error.statusCode = 401;
  return error;
};

module.exports = {
  createApiError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError
};