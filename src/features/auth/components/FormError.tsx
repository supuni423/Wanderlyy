import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

/** Server / network error shown above the submit button. */
export function FormError({ message }: { message?: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  if (!message) {
    return null;
  }
  return (
    <View
      style={[
        styles.box,
        {
          borderColor: colors.danger,
          borderRadius: radius.md,
          padding: spacing.sm + 4,
          backgroundColor: colors.surface,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      testID="form-error"
    >
      <Feather name="alert-circle" size={18} color={colors.danger} />
      <Text style={[typography.label, styles.text, { color: colors.danger }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  text: { flex: 1 },
});
