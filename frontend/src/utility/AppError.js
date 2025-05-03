/**
 * Custom error class for handling application-specific errors.
 *
 * - Extends the built-in `Error` class.
 * - Sets a custom error name (`AppError`) for easy identification.
 * - Captures the stack trace for better debugging (only available in V8 environments).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
 */
export default class AppError extends Error {
  constructor(...params) {
    // Pass all received parameters to the parent Error constructor.
    super(...params);

    // Ensure proper stack trace capture for debugging (only works in V8-based engines like Chrome & Node.js).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Set a custom error name for easy identification.
    this.name = 'AppError';
  }
}
