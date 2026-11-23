import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { makeStore } from '@/app/store';
import { ThemeProvider } from '@/theme';
import type { AuthState } from '@/features/auth';
import { RootNavigator } from '../RootNavigator';

const EMILY: AuthState = {
  status: 'authenticated',
  user: {
    id: 1,
    username: 'emilys',
    email: 'emily@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    image: '',
  },
};

async function renderNavigator(auth: AuthState) {
  const store = makeStore({ auth });
  await render(
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  return store;
}

describe('RootNavigator', () => {
  it('shows the auth stack when signed out', async () => {
    await renderNavigator({ status: 'unauthenticated', user: null });

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(screen.queryByText('Favourites')).toBeNull();
  });

  it('moves from login to register and back', async () => {
    await renderNavigator({ status: 'unauthenticated', user: null });

    await fireEvent.press(screen.getByRole('link'));
    expect(
      await screen.findByRole('button', { name: 'Create account' }),
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('link'));
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('shows the Home, Favourites and Profile tabs when signed in', async () => {
    await renderNavigator(EMILY);

    expect(screen.getByText('Hello, Emily')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Favourites')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('opens the details screen with only the country code', async () => {
    await renderNavigator(EMILY);

    await fireEvent.press(screen.getByRole('button', { name: 'Open Japan' }));

    expect(await screen.findByText('JPN')).toBeTruthy();
  });

  it('jumps from an empty Favourites tab to Home', async () => {
    await renderNavigator(EMILY);

    await fireEvent.press(screen.getByText('Favourites'));
    expect(await screen.findByText('No favourites yet')).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Explore countries' }),
    );
    expect(await screen.findByText('Hello, Emily')).toBeTruthy();
  });

  it('returns to the login screen after logging out from Profile', async () => {
    const store = await renderNavigator(EMILY);

    await fireEvent.press(screen.getByText('Profile'));
    expect(await screen.findByText('Emily Johnson')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
    expect(store.getState().auth.status).toBe('unauthenticated');
  });
});
