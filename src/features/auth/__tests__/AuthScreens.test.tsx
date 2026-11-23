import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { DEMO_ACCOUNT, LoginScreen, RegisterScreen } from '@/features/auth';

/** Validation runs asynchronously, so wait for the submitted values. */
async function expectSubmitted(onSubmit: jest.Mock, values: object) {
  // Generous timeout: the first run also compiles Zod, which can be slow.
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1), {
    timeout: 5000,
  });
  expect(onSubmit.mock.calls[0][0]).toEqual(values);
}

describe('LoginScreen', () => {
  async function renderLogin() {
    const onSubmit = jest.fn();
    const onGoToRegister = jest.fn();
    await render(
      <ThemeProvider>
        <LoginScreen onSubmit={onSubmit} onGoToRegister={onGoToRegister} />
      </ThemeProvider>,
    );
    return { onSubmit, onGoToRegister };
  }

  it('submits what the user typed', async () => {
    const { onSubmit } = await renderLogin();
    await fireEvent.changeText(screen.getByLabelText('Username'), 'traveller');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await expectSubmitted(onSubmit, {
      username: 'traveller',
      password: 'secret123',
    });
  });

  it('shows errors and does not submit an empty form', async () => {
    const { onSubmit } = await renderLogin();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your username')).toBeTruthy();
    expect(screen.getByText('Enter your password')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims spaces before submitting', async () => {
    const { onSubmit } = await renderLogin();
    await fireEvent.changeText(screen.getByLabelText('Username'), ' emilys ');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'emilyspass');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await expectSubmitted(onSubmit, DEMO_ACCOUNT);
  });

  it('fills in the demo account with one tap', async () => {
    const { onSubmit } = await renderLogin();
    await fireEvent.press(screen.getByLabelText('Use demo account'));
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await expectSubmitted(onSubmit, DEMO_ACCOUNT);
  });

  it('links to the registration screen', async () => {
    const { onGoToRegister } = await renderLogin();
    await fireEvent.press(screen.getByRole('link'));
    expect(onGoToRegister).toHaveBeenCalledTimes(1);
  });
});

describe('RegisterScreen', () => {
  async function renderRegister() {
    const onSubmit = jest.fn();
    const onGoToLogin = jest.fn();
    await render(
      <ThemeProvider>
        <RegisterScreen onSubmit={onSubmit} onGoToLogin={onGoToLogin} />
      </ThemeProvider>,
    );
    return { onSubmit, onGoToLogin };
  }

  it('submits every field of the form', async () => {
    const { onSubmit } = await renderRegister();
    const typeInto = (label: string, text: string) =>
      fireEvent.changeText(screen.getByLabelText(label), text);

    await typeInto('First name', 'Ada');
    await typeInto('Last name', 'Lovelace');
    await typeInto('Email', 'ada@example.com');
    await typeInto('Username', 'ada');
    await typeInto('Password', 'engine42');
    await typeInto('Confirm password', 'engine42');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create account' }),
    );

    await expectSubmitted(onSubmit, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      username: 'ada',
      password: 'engine42',
      confirmPassword: 'engine42',
    });
  });

  it('blocks submission when the passwords differ', async () => {
    const { onSubmit } = await renderRegister();
    await fireEvent.changeText(screen.getByLabelText('Password'), 'engine42');
    await fireEvent.changeText(
      screen.getByLabelText('Confirm password'),
      'engine43',
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Create account' }),
    );

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('links back to the login screen', async () => {
    const { onGoToLogin } = await renderRegister();
    await fireEvent.press(screen.getByRole('link'));
    expect(onGoToLogin).toHaveBeenCalledTimes(1);
  });
});
