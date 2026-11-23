import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import {
  AppButton,
  AppInput,
  EmptyState,
  ErrorState,
  LoadingIndicator,
  OfflineBanner,
} from '@/components';

const renderThemed = (ui: ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AppButton', () => {
  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await renderThemed(<AppButton title="Sign in" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores taps and shows a spinner while loading', async () => {
    const onPress = jest.fn();
    await renderThemed(<AppButton title="Sign in" onPress={onPress} loading />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
  });

  it('ignores taps when disabled', async () => {
    const onPress = jest.fn();
    await renderThemed(<AppButton title="Save" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('AppInput', () => {
  it('passes typed text to onChangeText', async () => {
    const onChangeText = jest.fn();
    await renderThemed(
      <AppInput label="Username" onChangeText={onChangeText} />,
    );
    await fireEvent.changeText(screen.getByLabelText('Username'), 'emilys');
    expect(onChangeText).toHaveBeenCalledWith('emilys');
  });

  it('shows the validation message', async () => {
    await renderThemed(<AppInput label="Password" error="Too short" />);
    expect(screen.getByText('Too short')).toBeTruthy();
  });

  it('lets the user show and hide a password', async () => {
    await renderThemed(<AppInput label="Password" secure />);
    const input = screen.getByLabelText('Password');
    expect(input.props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Hide password')).toBeTruthy();
  });
});

describe('state components', () => {
  it('LoadingIndicator announces its message', async () => {
    await renderThemed(<LoadingIndicator message="Finding countries…" />);
    expect(screen.getByLabelText('Finding countries…')).toBeTruthy();
  });

  it('ErrorState retries when "Try again" is tapped', async () => {
    const onRetry = jest.fn();
    await renderThemed(<ErrorState onRetry={onRetry} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ErrorState has no retry button without onRetry', async () => {
    await renderThemed(<ErrorState />);
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('EmptyState shows its title and action', async () => {
    const onAction = jest.fn();
    await renderThemed(
      <EmptyState
        title="No favourites yet"
        actionLabel="Explore countries"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('No favourites yet')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Explore countries' }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('OfflineBanner only renders while offline', async () => {
    const { rerender } = await renderThemed(<OfflineBanner visible={false} />);
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    await rerender(
      <ThemeProvider>
        <OfflineBanner visible detail="Last updated today" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('offline-banner')).toBeTruthy();
    expect(screen.getByText('Last updated today')).toBeTruthy();
  });
});
