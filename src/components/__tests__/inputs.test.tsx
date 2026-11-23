import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { AppInput, SearchBar } from '@/components';

const renderThemed = (ui: ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SearchBar', () => {
  it('has no clear button while empty', async () => {
    await renderThemed(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        accessibilityLabel="Search countries"
      />,
    );
    expect(screen.queryByLabelText('Clear search')).toBeNull();
  });

  it('clears the text with the x button', async () => {
    const onChangeText = jest.fn();
    await renderThemed(
      <SearchBar
        value="jap"
        onChangeText={onChangeText}
        accessibilityLabel="Search countries"
      />,
    );
    await fireEvent.press(screen.getByLabelText('Clear search'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('survives focus and blur', async () => {
    await renderThemed(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        accessibilityLabel="Search countries"
      />,
    );
    const input = screen.getByLabelText('Search countries');
    await fireEvent(input, 'focus');
    await fireEvent(input, 'blur');
    expect(input).toBeTruthy();
  });
});

describe('AppInput', () => {
  it('passes focus and blur through to the caller', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderThemed(
      <AppInput label="Email" onFocus={onFocus} onBlur={onBlur} />,
    );

    await fireEvent(screen.getByLabelText('Email'), 'focus');
    await fireEvent(screen.getByLabelText('Email'), 'blur');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('describes the error to screen readers', async () => {
    await renderThemed(<AppInput label="Email" error="Enter your email" />);
    expect(screen.getByLabelText('Email').props.accessibilityHint).toBe(
      'Enter your email',
    );
  });
});
