import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import alertSlice from '##/src/store/slices/alertSlice.js';
import applicationSlice from '##/src/store/slices/applicationSlice.js';
import authReducer from '##/src/store/slices/authSlice.js';
import userSlice from '##/src/store/slices/userSlice.js';

// Combine multiple reducers
const rootReducer = combineReducers({
  auth: authReducer,
  alert: alertSlice,
  application: applicationSlice,
  user: userSlice,
});

// Persist Config
const persistConfig = {
  key: 'root',
  storage,
  // Only persist these reducers
  whitelist: ['auth'],
};

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Required for Redux Persist
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };
