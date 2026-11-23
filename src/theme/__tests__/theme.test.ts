import {
  createTheme,
  darkColors,
  getButtonStyles,
  getInputStyles,
  lightColors,
} from '@/theme';

describe('theme tokens', () => {
  it('defines the same colour keys for light and dark mode', () => {
    expect(Object.keys(darkColors).sort()).toEqual(
      Object.keys(lightColors).sort(),
    );
  });

  it('picks the palette that matches the mode', () => {
    expect(createTheme('light').colors).toBe(lightColors);
    expect(createTheme('dark').colors).toBe(darkColors);
  });
});

describe('component styles', () => {
  const theme = createTheme('light');

  it('gives every button a touch target of at least 48dp', () => {
    const variants = [
      'primary',
      'secondary',
      'outline',
      'danger',
      'ink',
    ] as const;
    for (const variant of variants) {
      const { container } = getButtonStyles(theme, variant);
      expect(container.minHeight).toBeGreaterThanOrEqual(48);
    }
  });

  it('dims a disabled button', () => {
    expect(getButtonStyles(theme, 'primary', true).container.opacity).toBe(0.5);
  });

  it('shows the error colour on an invalid input even when focused', () => {
    const styles = getInputStyles(theme, { focused: true, hasError: true });
    expect(styles.field.borderColor).toBe(theme.colors.danger);
  });

  it('highlights a focused input with the primary colour', () => {
    const styles = getInputStyles(theme, { focused: true, hasError: false });
    expect(styles.field.borderColor).toBe(theme.colors.primary);
  });
});
