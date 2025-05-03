import jsesc from 'jsesc';

import { config } from '##/server/config/default.js';

const clientEnvironmentVariablesPayload = jsesc(
  {
    app: {
      title: config.title,
    },
    domain: {
      app: config.domain,
    },
    nodeEnv: config.nodeEnv,
  },
  { es6: true },
);

function getClientEnvironmentVariables(req, res) {
  res
    .type('text/javascript')
    .send(`export default ${clientEnvironmentVariablesPayload};`);
}

export { getClientEnvironmentVariables };
