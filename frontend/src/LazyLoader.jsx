import { lazy, Suspense } from 'react';

import config from '##/src/config/config.js';

/**
 * Higher-order component to create a lazy-loaded component with fallback.
 *
 * @param {Function} loadFn - Function returning a promise that resolves to
 *   a component module.
 * @param {ReactNode} [fallback=null] - Optional fallback UI during loading.
 * @returns {React.ComponentType} - A lazy-loaded component wrapped with Suspense.
 */
function lazyLoad(loadFn, fallback = null) {
  const loadComponent = async () => {
    try {
      return await loadFn();
    } catch (error) {
      // Prevent infinite reload loops by checking error type
      if (
        config.env === 'production' &&
        error.message.includes('failed to fetch')
      ) {
        window.location.reload();
      }

      // Return a null component to prevent rendering errors
      return { default: () => null };
    }
  };

  const LazyComponent = lazy(
    config.env === 'production' ? loadComponent : loadFn,
  );

  const LazyLoadedComponent = (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  LazyLoadedComponent.displayName = 'LazyLoadedComponent';

  return LazyLoadedComponent;
}

export default lazyLoad;
