import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/authApi';
import { authReducer } from '@/features/auth/authSlice';
import { countriesApi } from '@/features/countries/countriesApi';

/**
 * Redux store. Each feature adds its slice / API here as it is built
 * (countries, favourites, offline cache, theme).
 */
const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [countriesApi.reducerPath]: countriesApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Factory so tests can create a fresh store (optionally pre-filled). */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefault =>
      getDefault().concat(authApi.middleware, countriesApi.middleware),
  });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
