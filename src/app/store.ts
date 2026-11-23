import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { authApi } from '@/features/auth/authApi';
import { authReducer } from '@/features/auth/authSlice';
import { countriesApi } from '@/features/countries/countriesApi';
import { favouritesReducer } from '@/features/favourites/favouritesSlice';
import { countriesCacheReducer } from '@/features/offline/countriesCacheSlice';
import { networkReducer } from '@/features/offline/networkSlice';
import { themeReducer } from '@/features/settings/themeSlice';
import { authPersistConfig, rootPersistConfig } from './persistence';

/**
 * Redux store. Each feature adds its slice / API here as it is built.
 *
 * Two flavours share the same reducers:
 * - makeStore(): plain, in-memory store (used by tests)
 * - makePersistedStore(): the app's store, saved to AsyncStorage
 */
const reducers = {
  favourites: favouritesReducer,
  countriesCache: countriesCacheReducer,
  network: networkReducer,
  theme: themeReducer,
  [authApi.reducerPath]: authApi.reducer,
  [countriesApi.reducerPath]: countriesApi.reducer,
};

const rootReducer = combineReducers({ auth: authReducer, ...reducers });

export type RootState = ReturnType<typeof rootReducer>;

/** In-memory store, optionally pre-filled (tests use this). */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefault =>
      getDefault().concat(authApi.middleware, countriesApi.middleware),
  });
}

/** The app's store: favourites and the user profile survive restarts. */
export function makePersistedStore() {
  const persistedReducer = persistReducer(
    rootPersistConfig,
    combineReducers({
      auth: persistReducer(authPersistConfig, authReducer),
      ...reducers,
    }),
  );
  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefault =>
      getDefault({
        // redux-persist's own actions carry functions; that is expected.
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(authApi.middleware, countriesApi.middleware),
  });
  const persistor = persistStore(store);
  return { store, persistor };
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
