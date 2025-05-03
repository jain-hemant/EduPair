import _ from 'lodash';

import Api from '##/src/request.js';
import { setApplicationProcessingState } from '##/src/store/slices/applicationSlice.js';
import { store } from '##/src/store/store.js';

/**
 * Log out the current user and navigate to home page.
 *
 * NOTE: `logoutUser` may be called multiple times concurrently (e.g., when
 * multiple concurrent requests return 403). To avoid performing the logout
 * actions multiple times, ensure the function is only called once. This is
 * safe because:
 *
 * 1. `logoutUser` triggers a browser navigation, which unloads the window (and
 *    resets this global variable).
 *
 * 2. `logoutUser` will never be called multiple times in one window with
 *    different `nextUrls`, making it okay to disregard `nextUrl`.
 *
 * @param {String} nextUrl - The URL to navigate to. In case the user's current
 *   domain does not match the domain of the current organization, this URL can
 *   be used to correct the URL.
 */
const logoutUser = _.once(async (nextUrl = '/signup') => {
  // Clear local storage
  localStorage.clear();
  // Before proceeding, show the spinner so the user knows that there is an
  // operation in progress.
  store.dispatch(setApplicationProcessingState('Logging out...'));
  await Api.fetch('/api/auth/logout', { method: 'POST' });
  // After logging out, proceed to the next URL.
  window.location = nextUrl;
});

export { logoutUser };
