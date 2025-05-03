import policies from '##/src/policy/policies.js';

/**
 * Assigns a human-readable name to a React component.
 *
 * In production builds, React minifies component names, making debugging harder.
 * This function explicitly sets the `displayName` property to help restore
 * meaningful names in React DevTools.
 *
 * Additionally, due to an issue where `displayName` might not always work as
 * expected (see: https://github.com/facebook/react/issues/22315),
 * we also override the `name` property using `Object.defineProperty`
 * to ensure the name remains accessible.
 *
 * @param {React.Component} component - The React component to rename.
 * @param {string} displayName - The name to assign to the component.
 */
function setComponentDisplayName(component, displayName) {
  component.displayName = displayName;
  Object.defineProperty(component, 'name', { value: displayName });
}

/**
 * Check if a user with a particular role can perform the given action.
 * Supported by some optional data for dynamic rule checks.
 */
const check = (role, action) => {
  const permissions = policies[role];

  if (!permissions) {
    // Role is not present in the policies
    return false;
  }

  if (permissions.static && permissions.static.includes(action)) {
    // Static permission is granted to this role
    return true;
  }

  return false;
};

/**
 * Decide if a user with a selected role can perform a particular action based on some data.
 * It is exported for scenarios where using the component form of 'Can' is not feasible
 * (e.g. we just need to disable an input).
 */
function can({ role, perform }) {
  return check(role, perform);
}

const LOADING_TYPE = {
  APPLICATION: 'application',
  PROCESSING: 'processing',
};

export { setComponentDisplayName, can, LOADING_TYPE };
