import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import config from '##/src/config/config.js';
import { setAlertMessage } from '##/src/store/slices/alertSlice.js';
import AppError from '##/src/utility/AppError.js';

const IGNORED_ERRORS = [
  // This error occurs when a user navigates away or refreshes the page while an API request is still in progress.
  // Since it does not indicate a real issue with the application, it is safely ignored.
  'TypeError: Failed to fetch',
];

/**
 * Custom hook for handling API errors consistently across the application.
 *
 * - If the error is an instance of `AppError`, it displays the provided message.
 * - If the error is a generic JavaScript or API error, it logs and displays a fallback message.
 * - Ensures errors are logged to the backend for better debugging.
 *
 * @param {string} componentName - Name of the component where the error occurs.
 * @returns {Function} - A callback function for handling API errors.
 */
export default function useAPIErrorHandler(componentName) {
  const dispatchToRedux = useDispatch();

  if (config.env === 'development' && !componentName) {
    // Enforce specifying the component name in development for better debugging.
    throw new AppError(
      'Component name is required for error handling! Please provide it when using useAPIErrorHandler.',
    );
  }

  return useCallback(
    (functionName, error, fallbackMessage) => {
      // Since errors from the API pass through Redux, they become plain objects.
      // We cannot check `instanceof AppError`, so we manually check the error name.
      if (error.name === 'AppError') {
        // If it's an AppError, display its message.
        dispatchToRedux(setAlertMessage(error.message || fallbackMessage));
      } else if (!IGNORED_ERRORS.includes(error.stack?.split('\n')[0])) {
        // If it's a generic JavaScript error, display the fallback message.
        dispatchToRedux(setAlertMessage(fallbackMessage));
        // TODO:: Add logic to write the logs in backend once we have the api for this
      }
    },
    [dispatchToRedux],
  );
}
