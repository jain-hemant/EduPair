import * as profileController from '##/server/controllers/profile.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
  app
    .route('/api/profile/me')
    .all(isAllowed)
    .get(withAsyncErrorHandling(profileController.loadMe));
}
