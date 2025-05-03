// Importing environment variables from the server enables runtime modifications.
// This allows updates to take effect on the next browser reload without requiring
// a full rebuild and redeployment.

import clientEnv from '/api/js-modules/client-environment';

// NOTE: `process.env.NODE_ENV` behaves differently in Vite compared to other environment variables.
// Vite replaces it at build time instead of reading it dynamically, meaning changes require a rebuild.
// Reference: https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/plugins/clientInjections.ts#L85-L96

export default {
  app: {
    // Application title sourced from server-side environment variables.
    title: clientEnv.app.title,

    // Application version sourced from Vite's environment variables.
    // Defaults to 'default' if not provided.
    version: import.meta.env.VITE_APP_VERSION || 'default',
  },
  domain: {
    // Application domain sourced from the server environment.
    app: clientEnv.domain,
  },
  // Current environment (e.g., development, production, etc.).
  env: clientEnv.nodeEnv,
  email: {
    // Contact email for support inquiries.
    support: 'test@gmail.com',
  },
};
