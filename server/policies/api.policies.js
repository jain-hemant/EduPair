import ACL from 'acl2';

import { handleError } from '##/server/utility/utility.js';
import { USER_ROLES } from '##/shared/directory.js';

// ACL instance using a memory backend.
const acl = new ACL(new ACL.memoryBackend());

/**
 * Initializes ACL permissions for various user roles.
 *
 * This function sets up the permission rules using the ACL library.
 * It defines what resources each user role can access and what HTTP methods are allowed.
 *
 */

function invokePermissions() {
  acl.allow([
    {
      roles: [USER_ROLES.admin],
      allows: [
        // User routes
        {
          resources: '/api/user/update/:userId',
          permissions: ['patch'],
        },
        {
          resources: '/api/user/getAll',
          permissions: ['get'],
        },
        {
          resources: '/api/user/:userId',
          permissions: ['get'],
        },
        // Skill routes
        {
          resources: '/api/skills',
          permissions: ['post'],
        },
        {
          resources: '/api/skills',
          permissions: ['get'],
        },
        {
          resources: '/api/skills/:skillId',
          permissions: ['get'],
        },
        {
          resources: '/api/skills/:skillId',
          permissions: ['patch'],
        },
        {
          resources: '/api/skills/:skillId',
          permissions: ['delete'],
        },
        {
          resources: '/api/skills/category/grouped',
          permissions: ['get'],
        },
      ],
    },
    {
      roles: [USER_ROLES.admin, USER_ROLES.user],
      allows: [
        // User Routes
        {
          resources: '/api/profile/me',
          permissions: ['get'],
        },
        {
          resources: '/api/user/update',
          permissions: ['patch'],
        },
        {
          resources: '/api/user/change-password',
          permissions: ['post'],
        },
        {
          resources: '/api/user/getAll',
          permissions: ['get'],
        },
        {
          resources: '/api/user/credits/:userId',
          permissions: ['patch'],
        },
        {
          resources: '/api/user/:userId',
          permissions: ['get'],
        },
        {
          resources: '/api/user/update/:userId',
          permissions: ['patch'],
        },
        // Resource Routes
        {
          resources: '/api/resources',
          permissions: ['post'],
        },
        {
          resources: '/api/resources',
          permissions: ['get'],
        },
        {
          resources: '/api/resources/:resourceId',
          permissions: ['get'],
        },
        {
          resources: '/api/resources/:resourceId',
          permissions: ['patch'],
        },
        {
          resources: '/api/resources/:resourceId',
          permissions: ['delete'],
        },
        {
          resources: '/api/resources/:resourceId/access',
          permissions: ['post'],
        },
        {
          resources: '/api/resources/my-created',
          permissions: ['get'],
        },
        {
          resources: '/api/resources/my-accessed',
          permissions: ['get'],
        },
        // transaction routes
        {
          resources: '/api/transactions',
          permissions: ['get'],
        },
        {
          resources: '/api/transactions/:transactionId',
          permissions: ['get'],
        },
        {
          resources: '/api/transactions/credit/add',
          permissions: ['post'],
        },
        {
          resources: '/api/transactions/stats',
          permissions: ['get'],
        },
        // Review Routes
        {
          resources: '/api/review/create',
          permissions: ['post'],
        },
        {
          resources: '/api/review/getAll',
          permissions: ['get'],
        },
        {
          resources: '/api/review/:reviewId',
          permissions: ['get'],
        },
        {
          resources: '/api/review/update/:reviewId',
          permissions: ['patch'],
        },
        {
          resources: '/api/review/delete/:reviewId',
          permissions: ['delete'],
        },
        {
          resources: '/api/review/user/:userId',
          permissions: ['get'],
        },
        {
          resources: '/api/review/session/:sessionId',
          permissions: ['get'],
        },
      ],
    },
  ]);
}

/**
 * Middleware to verify if the current user is allowed to access the requested API route.
 *
 * It retrieves the user roles from `req.user`. If no user is set, it defaults to the GUEST role.
 * Then it checks if any of the user roles have permission to perform the HTTP method
 * (converted to lowercase) on the requested route path.
 *
 * IMPORTANT: This middleware is designed for Express 4.x. Ensure that it is wrapped using
 * async error handling (e.g., with a helper like `withAsyncErrorHandling`) to catch async errors.
 *
 * @param {Object} req - Express request object, expected to have `user` property with roles.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback to pass control to the next middleware.
 */

async function isAllowed(req, res, next) {
  // Determine user roles; default to guest if no user is authenticated.
  const roles = req.user ? [req.user.role] : [USER_ROLES.guest];

  try {
    // Check if any of the user's roles are allowed to access the current route
    // using the HTTP method (e.g., GET, POST, etc.) on the requested path.
    const isAllowedForRoles = await acl.areAnyRolesAllowed(
      roles,
      req.route.path,
      req.method.toLowerCase(),
    );

    if (isAllowedForRoles) {
      // Permission granted; proceed to the next middleware or route handler.
      return next();
    } else {
      // Permission denied; respond with 403 Forbidden.
      return res.status(403).json({ message: 'Permission denied' });
    }
  } catch (error) {
    // If an error occurs during the permission check, handle it using the custom error handler.
    return handleError(res, error);
  }
}

export { invokePermissions, isAllowed };
