import { USER_ROLES } from '##/shared/directory.js';

export default {
  [USER_ROLES.guest]: {
    static: ['sign-in:visit', 'sign-up:visit'],
  },
  [USER_ROLES.admin]: {
    static: ['admin-dashboard-visit'],
  },
  [USER_ROLES.viewer]: {
    static: ['viewer-dashboard-visit'],
  },
  [USER_ROLES.creator]: {
    static: ['creator-dashboard-visit'],
  },
};
