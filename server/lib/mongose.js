import path from 'path';
import { pathToFileURL } from 'url';

import mongoose from 'mongoose';

import { config } from '##/server/config/default.js';
import logger from '##/server/lib/logger.js';

async function connect() {
  try {
    // Enable strict mode for schemas
    mongoose.set('strict', true);

    // Connect to MongoDB
    await mongoose.connect(config.dbUrl);

    logger.info('MongoDB connection established successfully.');
  } catch (error) {
    logger.error(
      `Could not connect to MongoDB: ${error.stack || error.message}`,
    );
    process.exit(1); // Exit the process if the database connection fails
  }
}

async function disconnect() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    logger.error(
      `Error disconnecting from MongoDB: ${error.stack || error.message}`,
    );
  }
}

async function loadModels() {
  try {
    if (config.platform === 'win32') {
      // Load models on Windows
      const moduleUrls = config.files.server.models.map((modelPath) => {
        const absolutePath = path.resolve(modelPath);
        return pathToFileURL(absolutePath).href;
      });
      await Promise.all(moduleUrls.map((url) => import(url)));
      return;
    }

    await Promise.all(
      config.files.server.models.map((modelPath) => import(modelPath)),
    );
  } catch (error) {
    logger.error(
      `Error reading models directory: ${error.stack || error.message}`,
    );
  }
}

export { connect, disconnect, loadModels };
