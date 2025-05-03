import * as userController from '##/server/controllers/user.controller.js';
import { isAllowed } from '##/server/policies/api.policies.js';
import { withAsyncErrorHandling } from '##/server/utility/utility.js';

export default function routes(app) {
  // Public routes
  app
    .route('/api/user/register')
    .post(withAsyncErrorHandling(userController.registerUser));

  app
    .route('/api/user/login')
    .post(withAsyncErrorHandling(userController.loginUser));

  // Protected routes - require authentication
  app
    .route('/api/user/me')
    .all(isAllowed)
    .get(withAsyncErrorHandling(userController.getCurrentUser));

  app
    .route('/api/user/update')
    .all(isAllowed)
    .patch(withAsyncErrorHandling(userController.updateUser));

  app
    .route('/api/user/change-password')
    .all(isAllowed)
    .post(withAsyncErrorHandling(userController.changePassword));

  // Admin routes
  app
    .route('/api/user/getAll')
    .all(isAllowed)
    .get(withAsyncErrorHandling(userController.getAllUsers));

  app
    .route('/api/user/credits/:userId')
    .all(isAllowed)
    .patch(withAsyncErrorHandling(userController.updateCreditBalance));

  // Public user profile - anyone can view
  app
    .route('/api/user/:userId')
    .all(isAllowed)
    .get(withAsyncErrorHandling(userController.getUserById));

  // Admin update for specific user
  app
    .route('/api/user/update/:userId')
    .all(isAllowed)
    .patch(withAsyncErrorHandling(userController.updateUser));
}