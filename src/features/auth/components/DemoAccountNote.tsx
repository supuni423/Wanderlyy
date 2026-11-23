import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { DEMO_ACCOUNT } from '../demoAccount';

/** Dashed "sticky note" with the public demo login and a one-tap fill. */
export function DemoAccountNote({ onUse }: { onUse: () => void }) {
  const { colors, typography, radius, spacing, touchTarget } = useTheme();
  return (
    <View
      style={[
        styles.note,
        {
          borderColor: colors.accentPurple,
          borderRadius: radius.md,
          padding: spacing.sm + 4,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Feather name="key" size={18} color={colors.accentPurple} />
      <View style={styles.text}>
        <Text
          style={[typography.label, typography.accent, { color: colors.text }]}
        >
          Demo account
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {DEMO_ACCOUNT.username} · {DEMO_ACCOUNT.password}
        </Text>
      </View>
      <Pressable
        onPress={onUse}
        accessibilityRole="button"
        accessibilityLabel="Use demo account"
        style={[
          styles.use,
          {
            minHeight: touchTarget,
            minWidth: touchTarget,
            borderRadius: radius.pill,
          },
        ]}
      >
        <Text style={[typography.label, { color: colors.accentPurple }]}>
          Use it
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  text: { flex: 1 },
  use: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
