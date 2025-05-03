import { APP_VERSION_HEADER } from '##/shared/api.js';
import config from '##/src/config/config.js';
import AppError from '##/src/utility/AppError.js';
import { logoutUser } from '##/src/utility/auth.js';

/**
 * Makes a request against a codecast backend endpoint.
 */
async function apiFetch(url, options = {}) {
  // NOTE: `window.origin` is very similar to `window.location.origin`, except
  // in some rare cross-window edge cases which do not apply here.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/origin
  // See: https://stackoverflow.com/a/58091944/1727828
  if (new URL(url, window.origin).origin !== window.origin) {
    // `apiFetch` is reserved for fetching codecast backend endpoints.
    throw new Error(`Use regular \`fetch\` to make request to '${url}'`);
  }
  if (options.body)
    options.body =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);

  options.credentials = options.credentials || 'same-origin';
  options.headers = options.headers || {};
  options.headers.Accept = options.headers.Accept || 'application/json';
  options.headers['Content-Type'] =
    options.headers['Content-Type'] || 'application/json';
  options.headers[APP_VERSION_HEADER] = config.app.version;
  try {
    const response = await fetch(url, options);
    await checkStatus(response);
    return await parseJSON(response);
  } catch (error) {
    logError(error);
  }
}

async function checkStatus(response) {
  if (response.ok) {
    return;
  }
  if (response.status === 403) {
    // Forbidden status, the user is accessing an API they shouldn't be able to.
    // Log them out to force a new login / session
    await logoutUser();
    throw new AppError();
  } else if (response.status === 500) {
    // 500 statuses are unintentional errors, skip their messages.
    // Proper messaging will be handled by whoever is catching the error.
    const error = new AppError();

    // This is to match the SerializedError interface from @reduxjs/toolkit
    // https://redux-toolkit.js.org/api/createAsyncThunk#handling-thunk-errors
    error.code = response.status.toString();

    throw error;
  } else {
    // Other statuses are thrown intentionally, parse the response and use the message from it (if any)
    const parsedResponse = response.headers
      .get('content-type')
      ?.startsWith('application/json')
      ? await response.json()
      : await response.text();
    // If there is a message, use that to make a new AppError, otherwise just use a default message
    const error = new AppError(
      parsedResponse.message ? parsedResponse.message : response.statusText,
    );

    // This is to match the SerializedError interface from @reduxjs/toolkit
    // https://redux-toolkit.js.org/api/createAsyncThunk#handling-thunk-errors
    error.code = response.status.toString();

    throw error;
  }
}

async function parseJSON(response) {
  if (
    response &&
    response.headers.get('content-type')?.startsWith('application/json')
  ) {
    return await response.json();
  }

  return response;
}

function logError(error) {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
}

const Api = { fetch: apiFetch };
export default Api;
