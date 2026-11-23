import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export interface LoadingIndicatorProps {
  message?: string;
  /** Fill the screen and centre the spinner (default), or sit inline. */
  fullScreen?: boolean;
}

/** Themed spinner with a short message, announced to screen readers. */
export function LoadingIndicator({
  message = 'Loading…',
  fullScreen = true,
}: LoadingIndicatorProps) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View
      style={[styles.base, fullScreen && styles.fullScreen]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      testID="loading-indicator"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {!!message && (
        <Text
          style={[
            typography.label,
            typography.accent,
            { color: colors.textMuted, marginTop: spacing.sm },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  fullScreen: { flex: 1 },
});
