import module from 'node:module';
import path from 'path';

import dotenv from 'dotenv';
import * as glob from 'glob';
import Joi from 'joi';
import _ from 'lodash';

const require = module.createRequire(import.meta.url);
// Determine the path to the top-level `package.json` directory.
const packageRoot = path.dirname(require.resolve('##/package.json'));

const ASSETS = {
  server: {
    models: 'server/models/*.model.js',
    routes: 'server/routes/*.routes.js',
    policies: 'server/policies/*.policies.js',
  },
};

async function getAssetFiles() {
  const [models, routes, policies] = await Promise.all(
    [ASSETS.server.models, ASSETS.server.routes, ASSETS.server.policies].map(
      (pattern) => {
        let fullPath = path.join(packageRoot, pattern);
        if (process.platform === 'win32') {
          fullPath = fullPath.replace(/\\/g, '/');
        }

        return glob.glob(fullPath);
      },
    ),
  );
  return {
    server: { models, routes, policies },
  };
}

// Determine the appropriate .env file based on NODE_ENV
const envFile = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`;

// Load environment variables from the specified file
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Define a schema to validate environment variables
const envSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(5001),
    MONGODB_URL: Joi.string()
      .uri()
      .default('mongodb://localhost:27017/edupair'),
    DOMAIN: Joi.string().uri().default('http://localhost:3000'),
    NODE_ENV: Joi.string().default('development'),
    SESSION_SECRET: Joi.string().default('edupair-Secret'),
    APP_VERSION: Joi.string().default('default'),
    // TODO: Update default email host
    EMAIL_HOST: Joi.string().default('demo.com'),
    EMAIL_PORT: Joi.number().default(465),
    EMAIL_USER: Joi.string().default('support@demo.com'),
    EMAIL_PASSWORD: Joi.string().default('support@demo.com'),
  })
  // Allow additional environment variables
  .unknown();

// Validate the environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  // Throw an error if validation fails
  throw new Error(`Configuration validation error: ${error.message}`);
}

const defaultVars = {
  port: envVars.PORT,
  dbUrl: envVars.MONGODB_URL,
  domain: envVars.DOMAIN,
  nodeEnv: envVars.NODE_ENV,
  sessionSecret: envVars.SESSION_SECRET,
  sessionKey: 'sessionId',
  sessionCollectionName: 'sessions',
  title: 'application title',
  platform: process.platform,
  app: {
    version: envVars.APP_VERSION,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASSWORD,
  },
};

async function getConfig(config) {
  const assetFIles = await getAssetFiles();

  _.merge(config, {
    files: assetFIles,
  });
  return config;
}

const config = await getConfig(defaultVars);

export { config };
