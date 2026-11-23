import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig, PersistedState } from 'redux-persist';

/**
 * What is saved to AsyncStorage (and what is not).
 *
 * Saved:     favourites (whole slice), auth.user (public profile only)
 * Not saved: auth.status (recomputed at start-up), API caches,
 *            and NEVER the access/refresh tokens (they live in the Keychain).
 */

/** Bump when the saved shape changes; `migrate` below then runs. */
export const PERSIST_VERSION = 1;

export const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user'],
} satisfies Partial<PersistConfig<unknown>>;

type Stored = Record<string, unknown> & PersistedState;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Cleans a stored root state before it is loaded, so a damaged or old
 * save can never crash the app: broken favourites are dropped, and a
 * favourites slice that is not the expected shape is reset to empty.
 */
export function sanitizePersistedState(state: Stored): Stored {
  if (!state) {
    return state;
  }
  const favourites = state.favourites;
  if (favourites === undefined) {
    return state;
  }
  const empty = { ids: [], entities: {} };
  if (!isObject(favourites) || !isObject(favourites.entities)) {
    return { ...state, favourites: empty };
  }

  const entities: Record<string, unknown> = {};
  for (const [code, item] of Object.entries(favourites.entities)) {
    if (
      isObject(item) &&
      item.code === code &&
      typeof item.name === 'string' &&
      typeof item.savedAt === 'number'
    ) {
      entities[code] = item;
    }
  }
  const ids = Object.keys(entities).sort(
    (a, b) =>
      (entities[b] as { savedAt: number }).savedAt -
      (entities[a] as { savedAt: number }).savedAt,
  );
  return { ...state, favourites: { ids, entities } };
}

export const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: PERSIST_VERSION,
  // auth has its own nested config (above) so only `user` is saved.
  whitelist: ['favourites'],
  migrate: async (state: PersistedState) =>
    sanitizePersistedState(state as Stored),
} satisfies Partial<PersistConfig<unknown>>;
