import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDispatch, useSelector } from 'react-redux';

import Alert from '##/src/components/alerts/Alert.jsx';
import ErrorFallback from '##/src/components/alerts/ErrorBoundaryFallback.jsx';
import Loader from '##/src/Components/Loaders/Loader.jsx';
import config from '##/src/config/config.js';
import useAPIErrorHandler from '##/src/hooks/useAPIErrorHandling.js';
import Api from '##/src/request.js';
import {
  selectApplicationLoadingState,
  selectIsApplicationLoading,
  selectLoadingMessage,
  selectLoadingType,
  setApplicationLoadingState,
} from '##/src/store/slices/applicationSlice.js';
import {
  selectAuthenticated,
  setAuthenticated,
} from '##/src/store/slices/authSlice.js';
import { fetchMe, selectMe } from '##/src/store/slices/userSlice.js';
import { setComponentDisplayName } from '##/src/utility/utility.js';

export default function ApplicationContainer({ children }) {
  const isApplicationLoading = useSelector(selectApplicationLoadingState);
  const dispatchToRedux = useDispatch();
  const handleError = useAPIErrorHandler('ApplicationContainer');

  // The currently signed in user (if any)
  const currentUser = useSelector(selectMe);
  const loadingMessage = useSelector(selectLoadingMessage);
  const isLoading = useSelector(selectIsApplicationLoading);
  const loadingType = useSelector(selectLoadingType);
  const isAuthenticated = useSelector(selectAuthenticated);

  // Used to mark when the application is done loading
  const [isAuthenticationLoaded, setIsAuthenticationLoaded] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  // const [isAdminSettingsLoaded, setIsAdminSettingsLoaded] = useState(false);
  // const [isOrganizationFieldsLoaded, setIsOrganizationFieldsLoaded] =
  //   useState(false);
  // const [isUserListsLoaded, setIsUserListsLoaded] = useState(false);

  const handleErrorBoundaryError = useCallback(
    (error, info) => {
      error.stack = `${error.message}${info.componentStack}`;
      handleError('ErrorBoundary', error, '');
    },
    [handleError],
  );

  /**
   * Check the authentication status upon loading
   */
  useEffect(() => {
    async function checkAuthentication() {
      try {
        const result = await Api.fetch('/api/auth/isAuthenticated', {
          method: 'POST',
        });

        dispatchToRedux(setAuthenticated(result.isAuthed));
        setIsAuthenticationLoaded(true);
      } catch (error) {
        handleError('checkAuthentication', error, '');
        if (config.env !== 'development') {
          dispatchToRedux(setAuthenticated(false));
        }
      }
    }

    checkAuthentication();
  }, [dispatchToRedux, handleError]);

  useEffect(() => {
    async function getUserData() {
      try {
        await dispatchToRedux(fetchMe()).unwrap();
        setIsUserLoaded(true);
      } catch (error) {
        handleError(
          'getUserData',
          error,
          'Failed to load user data. Try again later.',
        );
      }
    }

    // We also get the user data during the login flow, in which case we don't
    // need to fetch it again.
    if (isAuthenticated && currentUser) {
      setIsUserLoaded(true);
    } else if (isAuthenticated && !currentUser) {
      getUserData();
    }
  }, [currentUser, dispatchToRedux, handleError, isAuthenticated]);

  /**
   * Once the application is loaded, clear the loading state
   */
  useEffect(() => {
    const unAuthenticatedUserLoaded =
      isAuthenticationLoaded && !isAuthenticated;
    const authenticatedUserLoaded =
      isAuthenticationLoaded && isAuthenticated && isUserLoaded && currentUser;

    if (
      isApplicationLoading &&
      (unAuthenticatedUserLoaded || authenticatedUserLoaded)
    ) {
      dispatchToRedux(setApplicationLoadingState(false));
    }
  }, [
    currentUser,
    dispatchToRedux,
    isApplicationLoading,
    isAuthenticated,
    isAuthenticationLoaded,
    isUserLoaded,
  ]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleErrorBoundaryError}
    >
      {isLoading && (
        <Loader show={isLoading} message={loadingMessage} type={loadingType} />
      )}
      {!isApplicationLoading && children}
      <Alert />
    </ErrorBoundary>
  );
}

setComponentDisplayName(ApplicationContainer, 'ApplicationContainer');

ApplicationContainer.propTypes = {
  children: PropTypes.node,
};
