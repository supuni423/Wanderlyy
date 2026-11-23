import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from './theme';

/**
 * Shared style recipes for buttons and inputs, so every screen
 * gets the same sizes, colours and touch targets.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export function getButtonStyles(
  theme: Theme,
  variant: ButtonVariant,
  disabled = false,
): { container: ViewStyle; label: TextStyle } {
  const { colors, spacing, radius, typography, touchTarget } = theme;

  const background: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.primaryMuted,
    outline: 'transparent',
    danger: colors.danger,
  };
  const foreground: Record<ButtonVariant, string> = {
    primary: colors.onPrimary,
    secondary: colors.text,
    outline: colors.primary,
    danger: colors.onPrimary,
  };

  return {
    container: {
      minHeight: touchTarget,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: background[variant],
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor: colors.primary,
      opacity: disabled ? 0.5 : 1,
    },
    label: {
      ...typography.label,
      fontSize: 16,
      color: foreground[variant],
    },
  };
}

export function getInputStyles(
  theme: Theme,
  state: { focused: boolean; hasError: boolean },
): { field: ViewStyle; input: TextStyle; label: TextStyle; error: TextStyle } {
  const { colors, spacing, radius, typography, touchTarget } = theme;

  let borderColor = colors.border;
  if (state.hasError) {
    borderColor = colors.danger;
  } else if (state.focused) {
    borderColor = colors.primary;
  }

  return {
    field: {
      minHeight: touchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor,
      backgroundColor: colors.surface,
    },
    input: {
      ...typography.body,
      flex: 1,
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    label: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    error: {
      ...typography.caption,
      color: colors.danger,
      marginTop: spacing.xs,
    },
  };
}
