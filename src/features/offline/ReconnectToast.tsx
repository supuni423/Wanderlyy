import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { useNetworkStatus } from './useNetworkStatus';

/** How long "Back online" stays on screen. */
export const RECONNECT_TOAST_MS = 3000;

/**
 * Small green note at the top of the app for a few seconds after the
 * connection comes back, so the user knows data is being refreshed.
 * Only shows on a real reconnect (offline -> online), not at start-up.
 */
export function ReconnectToast() {
  const { colors, typography, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { status } = useNetworkStatus();
  const previous = useRef(status);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cameBack = previous.current === 'offline' && status === 'online';
    previous.current = status;
    if (status === 'offline') {
      setVisible(false);
    }
    if (!cameBack) {
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), RECONNECT_TOAST_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          top: insets.top + spacing.sm,
          backgroundColor: colors.success,
          borderRadius: radius.pill,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID="reconnect-toast"
    >
      <Feather name="wifi" size={16} color={colors.background} />
      <Text style={[typography.label, { color: colors.background }]}>
        Back online · refreshing your countries
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
