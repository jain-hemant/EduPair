import * as authController from '##/server/controllers/auth.controller.js';

export default function routes(app) {
  app.route('/api/auth/login').post(authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.post('/api/auth/register', authController.registerUser);
  app.post('/api/auth/isAuthenticated', authController.isAuthenticated);
}
