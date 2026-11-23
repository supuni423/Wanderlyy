import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

/** "New here? Create account" style link between login and register. */
export function AuthSwitchLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const { colors, typography, touchTarget } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${prompt} ${action}`}
      style={[styles.link, { minHeight: touchTarget }]}
    >
      <Text style={[typography.body, { color: colors.textMuted }]}>
        {prompt}{' '}
        <Text
          style={[typography.label, styles.action, { color: colors.primary }]}
        >
          {action}
        </Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { alignItems: 'center', justifyContent: 'center' },
  action: { fontSize: 16, textDecorationLine: 'underline' },
});
