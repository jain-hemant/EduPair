import path from 'path';
import { pathToFileURL } from 'url';

// Middleware to compress response bodies for all requests
import compression from 'compression';
// Middleware to parse and manage cookies
import connectMongoDBSession from 'connect-mongodb-session';
import cookieParser from 'cookie-parser';
// Middleware to enable Cross-Origin Resource Sharing (CORS)
import cors from 'cors';
// Express framework for building web applications
import express from 'express';
import session from 'express-session';
// Middleware to enhance API's security by setting various HTTP headers
import helmet from 'helmet';

// Configuration settings for the server
import { config } from '##/server/config/default.js';

// Six months expiration period specified in seconds
const SIX_MONTHS = 15778476;

function configureApp(app) {
  // Disable 'X-Powered-By' header to make it less obvious that the application is using Express
  app.disable('x-powered-by');
  // Set the 'query parser' option to 'simple' to disable query string parsing
  app.set('query parser', 'simple');
}

function initSecurityHeaders(app) {
  // Enable response compression for better performance
  app.use(compression());
  // Enable XSS filter to prevent cross-site scripting attacks
  app.use(helmet.xssFilter());
  // Prevent browsers from sniffing MIME types
  app.use(helmet.noSniff());
  // Sets X-Download-Options to prevent Internet Explorer from executing downloads in site's context
  app.use(helmet.ieNoOpen());

  app.use(
    helmet.hsts({
      maxAge: SIX_MONTHS,
      includeSubDomains: true,
      force: true,
    }),
  );
}

function initSession(app) {
  const MongoDBStore = connectMongoDBSession(session);

  // Set up session middleware
  app.use(
    session({
      cookie: {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      },
      saveUninitialized: true,
      secret: config.sessionSecret,
      resave: true,
      rolling: true,
      name: config.sessionKey,
      store: new MongoDBStore({
        collectionName: config.sessionCollectionName,
        uri: config.dbUrl,
      }),
    }),
  );
}

function initMiddleware(app) {
  // Saves the raw, unparsed body for use in payload verification.
  function saveRawRequestBody(req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding);
  }

  app.use(
    express.json({
      // Limit the size of JSON payloads to 5MB, default is 100KB
      limit: '5mb',
      verify: saveRawRequestBody,
    }),
  );
  // Parse URL-encoded data with the querystring library (not qs)
  app.use(
    express.urlencoded({
      // See `query parser` option above for more context on why "extended"
      // parsing is disabled.
      extended: false,
      verify: saveRawRequestBody,
    }),
  );
  // Allow CORS for the specified domain
  app.use(
    cors({
      origin: [config.domain],
      // Include credentials (cookies, authorization headers) in CORS requests
      credentials: true,
    }),
  );
  // Enable cookie parsing and management
  app.use(cookieParser());
}

export async function init() {
  const app = express();

  configureApp(app);
  // Initialize security-related HTTP headers
  initSecurityHeaders(app);
  // Initialize middleware for request processing
  initMiddleware(app);
  // Order needs to follow fow passport to work correctly:
  // 1. session, 2. passport, 3. routes
  // Initialize session
  initSession(app);
  // Initialize passport
  await initPassportConfiguration(app);
  // Load server policies
  await loadServerPolicies();
  // Load routes
  await loadServerRoutes(app);

  // Return the initialized Express app
  return app;
}

async function initPassportConfiguration(app) {
  const { default: initPassport } = await import('##/server/lib/passport.js');
  initPassport(app);
}

async function loadServerPolicies(app) {
  if (config.platform === 'win32') {
    // Load routes on Windows
    const policyPathUrls = config.files.server.policies.map((policyPath) => {
      const absolutePath = path.resolve(policyPath);
      return pathToFileURL(absolutePath).href;
    });

    await Promise.all(
      policyPathUrls.map(async (url) => {
        const { invokePermissions } = await import(url);
        invokePermissions(app);
      }),
    );

    return;
  }

  await Promise.all(
    config.files.server.policies.map(async (policyPath) => {
      const { invokePermissions } = await import(policyPath);
      invokePermissions();
    }),
  );
}

async function loadServerRoutes(app) {
  if (config.platform === 'win32') {
    // Load routes on Windows
    const moduleUrls = config.files.server.routes.map((routePath) => {
      const absolutePath = path.resolve(routePath);
      return pathToFileURL(absolutePath).href;
    });

    await Promise.all(
      moduleUrls.map(async (url) => {
        const { default: route } = await import(url);
        await route(app);
      }),
    );

    return;
  }

  await Promise.all(
    config.files.server.routes.map(async (routePath) => {
      const { default: route } = await import(routePath);
      // Register each route with the Express app
      await route(app);
    }),
  );
}
