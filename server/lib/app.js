import { config } from '##/server/config/default.js';
import { init as initExpress } from '##/server/lib/express.js';
import logger from '##/server/lib/logger.js';
import {
  connect as mongooseConnect,
  disconnect as mongooseDisconnect,
  loadModels as mongooseLoadModels,
} from '##/server/lib/mongose.js';

async function init() {
  try {
    // Connect to MongoDB database
    await mongooseConnect();

    // Load models
    await mongooseLoadModels();

    // Initialize Express
    const app = await initExpress();

    return app;
  } catch (error) {
    logger.error(`init:: ${error.stack || error.message}`);
    // Re-throw error to be caught in the start function
    throw error;
  }
}

async function start() {
  try {
    const app = await init();

    const server = app.listen(config.port, () => {
      logger.info(`start:: Server is running at port: ${config.port}`);
    });

    registerShutdownHandlers(server);
  } catch (error) {
    logger.error(`[start]: ${error.stack || error.toString()}`);
    process.exit(1);
  }
}

function registerShutdownHandlers(server) {
  let shuttingDown = false;

  const stopServer = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      logger.warn(`Received ${signal}. Shutting down gracefully...`);

      // Close the server to stop accepting new connections
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error(`Error closing server: ${err.message}`);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      logger.info('HTTP server closed.');

      // Disconnect from the database
      await mongooseDisconnect();

      logger.info('Database connection closed.');

      process.exit(0);
    } catch (error) {
      logger.error(`stopServer:: ${error.stack || error.message}`);
      process.exit(1);
    }
  };

  // Handle termination signals
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => stopServer(signal));
  });

  // Handle uncaught exceptions and unhandled promise rejections
  process.on('uncaughtException', (error) => {
    logger.error(`uncaughtException:: ${error.stack || error.message}`);
    stopServer('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`unhandledRejection:: ${reason}`);
    stopServer('unhandledRejection');
  });
}

export { start };
