// passport-config.js
import { callbackify } from 'node:util';

import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import logger from '##/server/lib/logger.js';
const User = mongoose.model('User');

function initializePassport(app) {
  // Serialize sessions
  passport.serializeUser(
    callbackify(async (user) => {
      return user._id;
    }),
  );

  // Deserialize sessions
  passport.deserializeUser(
    callbackify(async (userId) => {
      if (!mongoose.isValidObjectId(userId)) {
        // If this error occurs, it's because an invalid user ID was somehow
        // written into the user session, which should be impossible and would
        // be a major error.
        logger.error('Cannot deserialize user object. Malformed user ID.', {
          userId,
        });
        return null;
      }
      return User.findOne({
        _id: userId,
      });
    }),
  );

  // Initialize local strategy
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      callbackify(async (email, password) => {
        const user = await User.findOne({
          email: email.toLowerCase(),
        });

        if (!(await user?.isValidPassword(password))) {
          throw new Error(
            `Invalid email or password (${new Date().toLocaleTimeString()})`,
          );
        }
        // Update the lastLoggedInDate field and save
        user.lastLoggedInDate = new Date();
        await user.save();
        return user;
      }),
    ),
  );

  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize());
  app.use(passport.session());
}

export default initializePassport;
