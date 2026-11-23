import * as Keychain from 'react-native-keychain';
import { makeStore } from '@/app/store';
import { restoreSession } from '../authSlice';
import {
  clearTokens,
  loadTokens,
  parseTokens,
  saveTokens,
  SESSION_SERVICE,
} from '../sessionStorage';

const SAVED = { accessToken: 'old-access', refreshToken: 'old-refresh' };

const ME = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://dummyjson.com/icon/emilys/128',
  // /auth/me also returns private data the app must not keep.
  password: 'emilyspass',
  ssn: '900-590-289',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** Queue fetch results in order; an Error simulates being offline. */
function mockFetch(...results: (Response | Error)[]) {
  const spy = jest.spyOn(globalThis, 'fetch');
  for (const result of results) {
    if (result instanceof Error) {
      spy.mockRejectedValueOnce(result);
    } else {
      spy.mockResolvedValueOnce(result);
    }
  }
  return spy;
}

async function restore() {
  const store = makeStore();
  await store.dispatch(restoreSession());
  return store.getState().auth;
}

beforeEach(() => clearTokens());
afterEach(() => jest.restoreAllMocks());

describe('sessionStorage', () => {
  it('saves and reads back both tokens', async () => {
    expect(await saveTokens(SAVED)).toBe(true);
    expect(await loadTokens()).toEqual(SAVED);
  });

  it('stores them under its own Keychain service, device-only', async () => {
    await saveTokens(SAVED);
    expect(Keychain.setGenericPassword).toHaveBeenLastCalledWith(
      'session',
      JSON.stringify(SAVED),
      {
        service: SESSION_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
  });

  it('only stores the two token fields', async () => {
    await saveTokens({ ...SAVED, username: 'emilys' } as typeof SAVED);
    expect(Keychain.setGenericPassword).toHaveBeenLastCalledWith(
      'session',
      JSON.stringify(SAVED),
      expect.anything(),
    );
  });

  it('deletes the tokens', async () => {
    await saveTokens(SAVED);
    await clearTokens();
    expect(await loadTokens()).toBeNull();
  });

  it('treats damaged data as no session', () => {
    expect(parseTokens('not json')).toBeNull();
    expect(parseTokens('{"accessToken":"a"}')).toBeNull();
    expect(parseTokens('{"accessToken":"","refreshToken":"r"}')).toBeNull();
  });

  it('reports failure if the Keychain is unavailable', async () => {
    jest
      .mocked(Keychain.setGenericPassword)
      .mockRejectedValueOnce(new Error('no keystore'));
    expect(await saveTokens(SAVED)).toBe(false);
  });
});

describe('restoreSession', () => {
  it('starts signed out when nothing is saved', async () => {
    const fetchSpy = mockFetch();
    expect(await restore()).toEqual({ status: 'unauthenticated', user: null });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('signs in with a valid saved token and keeps only the profile', async () => {
    await saveTokens(SAVED);
    const fetchSpy = mockFetch(json(200, ME));

    const auth = await restore();

    expect(auth.status).toBe('authenticated');
    expect(auth.user).toEqual({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://dummyjson.com/icon/emilys/128',
    });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://dummyjson.com/auth/me');
    expect(init?.headers).toEqual({ Authorization: 'Bearer old-access' });
  });

  it('refreshes an expired token and saves the new pair', async () => {
    await saveTokens(SAVED);
    const fetchSpy = mockFetch(
      json(401, { message: 'Invalid/Expired Token!' }),
      json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }),
      json(200, ME),
    );

    const auth = await restore();

    expect(auth.status).toBe('authenticated');
    expect(await loadTokens()).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(fetchSpy.mock.calls[1][0]).toBe(
      'https://dummyjson.com/auth/refresh',
    );
    expect(fetchSpy.mock.calls[2][1]?.headers).toEqual({
      Authorization: 'Bearer new-access',
    });
  });

  it('signs out and deletes the tokens if the refresh token is rejected', async () => {
    await saveTokens(SAVED);
    mockFetch(
      json(401, { message: 'Invalid/Expired Token!' }),
      json(403, { message: 'Invalid refresh token' }),
    );

    expect(await restore()).toEqual({ status: 'unauthenticated', user: null });
    expect(await loadTokens()).toBeNull();
  });

  it('stays signed in while offline (offline-first)', async () => {
    await saveTokens(SAVED);
    mockFetch(new TypeError('Network request failed'));

    const auth = await restore();

    expect(auth.status).toBe('authenticated');
    expect(await loadTokens()).toEqual(SAVED);
  });

  it('keeps the session if the server has a temporary error', async () => {
    await saveTokens(SAVED);
    mockFetch(json(500, { message: 'Server error' }));

    expect((await restore()).status).toBe('authenticated');
    expect(await loadTokens()).toEqual(SAVED);
  });
});
