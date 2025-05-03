import PropTypes from 'prop-types';

import { setComponentDisplayName } from '##/src/utility/utility.js';

/**
 * This component is displayed when an error occurs during rendering.
 * Based on: https://github.com/bvaughn/react-error-boundary
 */
function ErrorFallback({ error }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 gap-5">
      <p className="text-lg font-semibold text-red-600">
        Something went wrong:
      </p>
      <pre className="bg-gray-200 p-10 rounded-md text-sm text-gray-700 w-full break-words text-wrap">
        {error.message}
      </pre>
      <button
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
        onClick={() => {
          window.location = '/';
        }}
      >
        Reload Application
      </button>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

setComponentDisplayName(ErrorFallback, 'ErrorFallback');

export default ErrorFallback;
