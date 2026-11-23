import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

export interface OfflineBannerProps {
  /** Show the banner only while the device is offline. */
  visible: boolean;
  /** Main line; defaults to the saved-countries message. */
  message?: string;
  /** Extra detail, e.g. when the saved data was last updated. */
  detail?: string;
}

/**
 * Strip shown at the top of a screen when there is no connection.
 * Screens decide when to show it (useNetworkStatus) and what to say.
 */
export function OfflineBanner({
  visible,
  message = "You're offline. Showing saved countries.",
  detail,
}: OfflineBannerProps) {
  const { colors, typography, spacing, radius } = useTheme();
  if (!visible) {
    return null;
  }
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.warningBg,
          borderColor: colors.warning,
          borderRadius: radius.md,
          marginHorizontal: spacing.md,
          marginVertical: spacing.sm,
          padding: spacing.sm + 4,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID="offline-banner"
    >
      <Feather name="wifi-off" size={18} color={colors.warning} />
      <View style={styles.text}>
        <Text style={[typography.label, { color: colors.warning }]}>
          {message}
        </Text>
        {!!detail && (
          <Text style={[typography.caption, { color: colors.warning }]}>
            {detail}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  text: { flex: 1 },
});
