import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedState } from 'redux-persist';
import { authApi } from '@/features/auth/authApi';
import type { CountrySummary } from '@/features/countries';
import {
  selectFavourites,
  toggleFavourite,
} from '@/features/favourites/favouritesSlice';
import { sanitizePersistedState } from '../persistence';
import { makePersistedStore } from '../store';

const JAPAN: CountrySummary = {
  code: 'JPN',
  alpha2: 'JP',
  name: 'Japan',
  officialName: 'Japan',
  capital: 'Tokyo',
  region: 'Asia',
  subregion: 'Eastern Asia',
  population: 122430000,
  flagUrl: 'https://flags.restcountries.com/v5/w640/jp.png',
  flagEmoji: '🇯🇵',
};

/** Starts a persisted store and waits until it has read saved state. */
async function startApp() {
  const app = makePersistedStore();
  await new Promise<void>(resolve => {
    if (app.persistor.getState().bootstrapped) {
      resolve();
      return;
    }
    const unsubscribe = app.persistor.subscribe(() => {
      if (app.persistor.getState().bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });
  return app;
}

async function everythingSaved(): Promise<string> {
  // AsyncStorage v3 has no multiGet, so read every key one by one.
  const keys = await AsyncStorage.getAllKeys();
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return keys.map((key, i) => `${key}=${values[i]}`).join('\n');
}

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.restoreAllMocks());

describe('persisted store', () => {
  it('keeps favourites across an app restart', async () => {
    const first = await startApp();
    first.store.dispatch(toggleFavourite(JAPAN));
    await first.persistor.flush();

    const second = await startApp();
    expect(selectFavourites(second.store.getState())).toEqual([
      expect.objectContaining({ code: 'JPN', name: 'Japan' }),
    ]);
  });

  it('saves the user profile but not the auth status', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          username: 'emilys',
          email: 'emily@example.com',
          firstName: 'Emily',
          lastName: 'Johnson',
          image: '',
          accessToken: 'secret-access',
          refreshToken: 'secret-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const first = await startApp();
    await first.store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );
    await first.persistor.flush();

    const second = await startApp();
    const auth = second.store.getState().auth;
    expect(auth.user?.firstName).toBe('Emily');
    // Status is always re-checked against the Keychain at start-up.
    expect(auth.status).toBe('checking');
  });

  it('never writes tokens to AsyncStorage', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1,
          username: 'emilys',
          email: 'e@example.com',
          firstName: 'Emily',
          lastName: 'Johnson',
          image: '',
          accessToken: 'secret-access',
          refreshToken: 'secret-refresh',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const app = await startApp();
    await app.store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );
    app.store.dispatch(toggleFavourite(JAPAN));
    await app.persistor.flush();

    const saved = await everythingSaved();
    expect(saved).toContain('persist:auth');
    expect(saved).toContain('JPN');
    expect(saved).not.toContain('secret-access');
    expect(saved).not.toContain('secret-refresh');
    expect(saved).not.toContain('accessToken');
  });

  it('starts cleanly if the saved favourites are damaged', async () => {
    await AsyncStorage.setItem(
      'persist:root',
      JSON.stringify({
        favourites: JSON.stringify({ ids: 'oops', entities: 42 }),
        _persist: JSON.stringify({ version: 0, rehydrated: true }),
      }),
    );

    const app = await startApp();
    expect(selectFavourites(app.store.getState())).toEqual([]);
  });
});

describe('sanitizePersistedState', () => {
  const persisted = { version: 1, rehydrated: true };
  const saved = (savedAt: number, code: string) => ({
    ...JAPAN,
    code,
    savedAt,
  });

  it('keeps valid favourites and rebuilds their order (newest first)', () => {
    const clean = sanitizePersistedState({
      _persist: persisted,
      favourites: {
        ids: ['wrong-order'],
        entities: { JPN: saved(1, 'JPN'), PER: saved(2, 'PER') },
      },
    } as PersistedState & Record<string, unknown>);

    expect(clean.favourites).toEqual({
      ids: ['PER', 'JPN'],
      entities: { JPN: saved(1, 'JPN'), PER: saved(2, 'PER') },
    });
  });

  it('drops broken entries', () => {
    const clean = sanitizePersistedState({
      _persist: persisted,
      favourites: {
        ids: ['JPN', 'BAD', 'MIX'],
        entities: {
          JPN: saved(1, 'JPN'),
          BAD: { code: 'BAD' },
          MIX: saved(3, 'NOT-MIX'),
        },
      },
    } as PersistedState & Record<string, unknown>);

    expect(clean.favourites).toEqual({
      ids: ['JPN'],
      entities: { JPN: saved(1, 'JPN') },
    });
  });

  it('resets a favourites slice with the wrong shape', () => {
    const clean = sanitizePersistedState({
      _persist: persisted,
      favourites: 'not an object',
    } as PersistedState & Record<string, unknown>);
    expect(clean.favourites).toEqual({ ids: [], entities: {} });
  });

  it('leaves a first-run (empty) state alone', () => {
    expect(
      sanitizePersistedState(
        undefined as unknown as PersistedState & Record<string, unknown>,
      ),
    ).toBeUndefined();
  });
});
