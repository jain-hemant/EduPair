import * as jsController from '##/server/controllers/js.controller.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

/**
 * Server-rendered JavaScript modules.
 *
 * Each route renders JavaScript code which is meant to be imported/consumed by
 * frontend JavaScript.
 */

export default function routes(app) {
  app
    .route('/api/js-modules/client-environment')
    .get(withAsyncErrorHandling(jsController.getClientEnvironmentVariables));
}
