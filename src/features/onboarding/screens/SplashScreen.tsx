import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

/**
 * Branded splash shown while the app checks its saved state.
 * The native launch screen uses the same cream colour, so the
 * hand-off from Android to React Native has no white flash.
 */
export function SplashScreen() {
  const { colors, typography, spacing } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.background }]}
      accessibilityLabel="Wanderlyy is loading"
    >
      <Animated.View
        style={[styles.center, { opacity: fade, transform: [{ scale }] }]}
      >
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primaryMuted,
              borderColor: colors.primary,
            },
          ]}
        >
          <Feather name="compass" size={46} color={colors.primary} />
        </View>
        <Text
          style={[typography.display, styles.title, { color: colors.text }]}
        >
          Wander
          <Text style={[typography.accent, { color: colors.primary }]}>
            lyy
          </Text>
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, marginTop: spacing.xs },
          ]}
        >
          Discover the world, even offline
        </Text>
      </Animated.View>
    </View>
  );
}

const BADGE = 104;

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    transform: [{ rotate: '-8deg' }],
  },
  title: { fontSize: 40, lineHeight: 48 },
});
