import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { makePersistedStore, makeStore } from '@/app/store';
import { RootNavigator } from '@/navigation';
import { getApiErrorMessage } from '@/services/api/errors';
import { ThemeProvider } from '@/theme';
import { authApi } from '../authApi';
import { logout, restoreSession } from '../authSlice';
import { clearTokens, loadTokens } from '../sessionStorage';

/**
 * Authentication persistence, end to end: what survives an app restart
 * (and what must not), using the real persisted store, the in-memory
 * Keychain mock and a mocked network.
 */

const EMILY = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: '',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const LOGIN_OK = () =>
  json(200, { ...EMILY, accessToken: 'acc-1', refreshToken: 'ref-1' });

/** A freshly started app: persisted store, saved state read back. */
async function startApp() {
  const app = makePersistedStore();
  await waitFor(() => expect(app.persistor.getState().bootstrapped).toBe(true));
  return app;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await clearTokens();
});
afterEach(() => jest.restoreAllMocks());

describe('session across restarts', () => {
  it('stays signed in after a restart', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(LOGIN_OK())
      .mockResolvedValueOnce(json(200, EMILY)); // /auth/me after restart

    const first = await startApp();
    await first.store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );
    await first.persistor.flush();

    const second = await startApp();
    await second.store.dispatch(restoreSession());

    // toMatchObject: the persisted slice also carries redux-persist's `_persist`.
    expect(second.store.getState().auth).toMatchObject({
      status: 'authenticated',
      user: EMILY,
    });
    // The restored session used the saved access token.
    const [, init] = fetchSpy.mock.calls[1];
    expect(init?.headers).toEqual({ Authorization: 'Bearer acc-1' });
  });

  it('shows the saved profile when restarting offline', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(LOGIN_OK())
      .mockRejectedValueOnce(new TypeError('Network request failed'));

    const first = await startApp();
    await first.store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );
    await first.persistor.flush();

    const second = await startApp();
    await second.store.dispatch(restoreSession());

    // toMatchObject: the persisted slice also carries redux-persist's `_persist`.
    expect(second.store.getState().auth).toMatchObject({
      status: 'authenticated',
      user: EMILY,
    });
  });

  it('is signed out after logging out and restarting', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(LOGIN_OK());

    const first = await startApp();
    await first.store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );
    await first.store.dispatch(logout());
    await first.persistor.flush();

    const second = await startApp();
    // Same spy as above: forget the login call before checking the restart.
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    fetchSpy.mockClear();
    await second.store.dispatch(restoreSession());

    // toMatchObject: the persisted slice also carries redux-persist's `_persist`.
    expect(second.store.getState().auth).toMatchObject({
      status: 'unauthenticated',
      user: null,
    });
    expect(await loadTokens()).toBeNull();
    // No tokens means no need to ask the server anything.
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('login when the Keychain cannot save', () => {
  it('refuses to sign in instead of keeping tokens somewhere unsafe', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(LOGIN_OK());
    jest
      .mocked(Keychain.setGenericPassword)
      .mockRejectedValueOnce(new Error('Keystore unavailable'));
    const store = makeStore({
      auth: { status: 'unauthenticated', user: null },
    });

    const result = await store.dispatch(
      authApi.endpoints.login.initiate({
        username: 'emilys',
        password: 'emilyspass',
      }),
    );

    expect(getApiErrorMessage(result.error)).toBe(
      'Could not save your session securely. Please try again.',
    );
    expect(store.getState().auth.status).toBe('unauthenticated');
    const everything = JSON.stringify(store.getState());
    expect(everything).not.toContain('acc-1');
  });
});

describe('registration flow', () => {
  async function openRegister() {
    await render(
      <Provider
        store={makeStore({ auth: { status: 'unauthenticated', user: null } })}
      >
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
    await fireEvent.press(screen.getByRole('link'));
    await screen.findByRole('button', { name: 'Create account' });
  }

  const fill = async (label: string, text: string) =>
    fireEvent.changeText(screen.getByLabelText(label), text);

  it('welcomes the new user, then returns to sign in', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      json(201, {
        id: 209,
        firstName: 'Ada',
        username: 'ada_l',
        password: 'engine42',
      }),
    );
    const alert = jest.spyOn(Alert, 'alert');
    await openRegister();

    await fill('First name', 'Ada');
    await fill('Last name', 'Lovelace');
    await fill('Email', 'ada@example.com');
    await fill('Username', 'ada_l');
    await fill('Password', 'engine42');
    await fill('Confirm password', 'engine42');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create account' }),
    );

    await waitFor(() => expect(alert).toHaveBeenCalled());
    expect(alert.mock.calls[0][0]).toBe('Welcome, Ada!');
    const goToSignIn = alert.mock.calls[0][2]?.find(
      b => b.text === 'Go to sign in',
    );
    await act(async () => goToSignIn?.onPress?.());

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('shows the server message when registration fails', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(400, { message: 'Username already taken' }));
    await openRegister();

    await fill('First name', 'Ada');
    await fill('Last name', 'Lovelace');
    await fill('Email', 'ada@example.com');
    await fill('Username', 'ada_l');
    await fill('Password', 'engine42');
    await fill('Confirm password', 'engine42');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create account' }),
    );

    expect(await screen.findByText('Username already taken')).toBeTruthy();
  });

  it('re-checks the confirm field when the first password changes', async () => {
    await openRegister();

    await fill('Password', 'engine42');
    await fill('Confirm password', 'engine42');
    await fireEvent(screen.getByLabelText('Confirm password'), 'blur');
    expect(screen.queryByText('Passwords do not match')).toBeNull();

    await fill('Password', 'engine43');

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
  });
});
