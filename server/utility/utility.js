import logger from '##/server/lib/logger.js';

/**
 * Utility functions for the server
 */

// Handle API errors
export function handleError(res, error) {
  logger.error(error.stack || error.message);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = {};

    for (const field in error.errors) {
      errors[field] = error.errors[field].message;
    }

    return maybeSendError(res, {
      message: 'Validation error',
      statusCode: 400,
      errors,
    });
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return maybeSendError(res, {
      message: `${field} already exists`,
      statusCode: 400,
    });
  }

  // Default server error
  maybeSendError(res, {
    message: 'Unexpected error occurred. Please try again later.',
    statusCode: 500,
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message,
  });
}

/**
 * TODO:
 * 1. Add more error handling
 */

// Ensure the response isn't sent multiple times
function maybeSendError(res, { statusCode, message, errors }) {
  if (!res.headersSent) {
    res.status(statusCode).json({ message, ...(errors && { errors }) });
  }
}

/**
 * Wraps an Express route handler to catch both synchronous and asynchronous errors.
 *
 * In Express 4.x, async route handlers that throw errors or return rejected promises
 * do not automatically pass the error to the error-handling middleware. This wrapper
 * catches any errors thrown by the handler and passes them to a custom error handling
 * function, `handleError`, ensuring that the request does not hang due to unhandled promise rejections.
 *
 * NOTE: With Express 5.x and later, native async error handling is supported, so this wrapper
 * may become unnecessary.
 *
 * @param {Function} handler - An Express route handler that may be asynchronous.
 * @returns {Function} A new handler that catches errors and forwards them to the custom error handler.
 */
export function withAsyncErrorHandling(handler) {
  return async function wrapped(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(error);
      handleError(res, error);
    }
  };
}