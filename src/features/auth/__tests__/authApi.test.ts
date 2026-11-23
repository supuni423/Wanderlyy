import { makeStore } from '@/app/store';
import { authApi } from '../authApi';
import { signedOut } from '../authSlice';
import { toUser, type LoginResponse } from '../authTypes';

const LOGIN_RESPONSE: LoginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://dummyjson.com/icon/emilys/128',
  accessToken: 'secret-access-token',
  refreshToken: 'secret-refresh-token',
};

function mockFetchOnce(status: number, body: unknown) {
  return jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

afterEach(() => jest.restoreAllMocks());

describe('toUser', () => {
  it('copies the profile and drops the tokens', () => {
    const user = toUser(LOGIN_RESPONSE);
    expect(user).toEqual({
      id: 1,
      username: 'emilys',
      email: 'emily.johnson@x.dummyjson.com',
      firstName: 'Emily',
      lastName: 'Johnson',
      image: 'https://dummyjson.com/icon/emilys/128',
    });
    expect(user).not.toHaveProperty('accessToken');
    expect(user).not.toHaveProperty('refreshToken');
  });
});

describe('login', () => {
  it('posts the credentials to DummyJSON', async () => {
    const fetchSpy = mockFetchOnce(200, LOGIN_RESPONSE);
    const store = makeStore();

    await store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );

    const request = fetchSpy.mock.calls[0][0] as Request;
    expect(request.url).toBe('https://dummyjson.com/auth/login');
    expect(request.method).toBe('POST');
    expect(await request.json()).toEqual({
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 60,
    });
  });

  it('signs the user in without putting tokens in Redux', async () => {
    mockFetchOnce(200, LOGIN_RESPONSE);
    const store = makeStore();

    await store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );

    const state = store.getState();
    expect(state.auth.status).toBe('authenticated');
    expect(state.auth.user?.firstName).toBe('Emily');
    // Check the whole store, including RTK Query's own cache.
    const everything = JSON.stringify(state);
    expect(everything).not.toContain('secret-access-token');
    expect(everything).not.toContain('secret-refresh-token');
  });

  it('stays signed out when the credentials are wrong', async () => {
    mockFetchOnce(400, { message: 'Invalid credentials' });
    const store = makeStore();

    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ username: 'emilys', password: 'x' }),
    );

    expect(result.error).toMatchObject({ status: 400 });
    expect(store.getState().auth).toEqual({
      status: 'unauthenticated',
      user: null,
    });
  });

  it('forgets the user on sign out', async () => {
    mockFetchOnce(200, LOGIN_RESPONSE);
    const store = makeStore();
    await store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );

    store.dispatch(signedOut());

    expect(store.getState().auth).toEqual({
      status: 'unauthenticated',
      user: null,
    });
  });
});

describe('register', () => {
  it('keeps only safe fields from the echoed response', async () => {
    mockFetchOnce(201, {
      id: 209,
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada_l',
      email: 'ada@example.com',
      password: 'engine42',
    });
    const store = makeStore();

    const result = await store.dispatch(
      authApi.endpoints.register.initiate({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        username: 'ada_l',
        password: 'engine42',
        confirmPassword: 'engine42',
      }),
    );

    expect(result.data).toEqual({
      id: 209,
      username: 'ada_l',
      firstName: 'Ada',
    });
    expect(JSON.stringify(store.getState())).not.toContain('engine42');
  });
});
