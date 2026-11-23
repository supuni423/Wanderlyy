import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

interface SettingsRowProps {
  icon: FeatherIconName;
  label: string;
  hint?: string;
  onPress: () => void;
  /** Red text and icon for actions that delete something. */
  destructive?: boolean;
  disabled?: boolean;
  last?: boolean;
}

/** Tappable settings line (48dp+), with an optional one-line hint. */
export function SettingsRow({
  icon,
  label,
  hint,
  onPress,
  destructive = false,
  disabled = false,
  last = false,
}: SettingsRowProps) {
  const { colors, typography, touchTarget } = useTheme();
  const tone = destructive ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.row,
        { minHeight: touchTarget + 8, opacity: disabled ? 0.45 : 1 },
        pressed && { backgroundColor: colors.surfaceMuted },
        !last && [styles.divider, { borderBottomColor: colors.border }],
      ]}
    >
      <Feather name={icon} size={20} color={tone} />
      <View style={styles.text}>
        <Text
          style={[
            typography.body,
            { color: destructive ? colors.danger : colors.text },
          ]}
        >
          {label}
        </Text>
        {!!hint && (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {hint}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  divider: { borderBottomWidth: 1 },
  text: { flex: 1 },
});
