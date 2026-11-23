import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

interface StateMessageProps {
  icon: FeatherIconName;
  /** Colour of the icon sticker. */
  tone: string;
  title: string;
  message?: string;
  /** Optional button(s) under the message. */
  children?: ReactNode;
  testID?: string;
}

/**
 * Shared layout for full-screen states (error, empty): a tilted
 * scrapbook-style icon sticker, a title, a message and an action.
 */
export function StateMessage({
  icon,
  tone,
  title,
  message,
  children,
  testID,
}: StateMessageProps) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.lg }]} testID={testID}>
      <View
        style={[
          styles.sticker,
          { borderColor: tone, backgroundColor: colors.paper },
        ]}
      >
        <Feather name={icon} size={34} color={tone} />
      </View>
      <Text
        style={[typography.h1, styles.center, { color: colors.text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {!!message && (
        <Text
          style={[
            typography.body,
            styles.center,
            { color: colors.textMuted, marginTop: spacing.sm },
          ]}
        >
          {message}
        </Text>
      )}
      {children && <View style={{ marginTop: spacing.lg }}>{children}</View>}
    </View>
  );
}

const STICKER = 84;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sticker: {
    width: STICKER,
    height: STICKER,
    borderRadius: STICKER / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    transform: [{ rotate: '-6deg' }],
  },
  center: { textAlign: 'center', maxWidth: 320 },
});
