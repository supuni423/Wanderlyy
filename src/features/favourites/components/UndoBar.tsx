import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

/** How long the Undo bar stays before the removal becomes final. */
export const UNDO_TIMEOUT_MS = 4000;

interface UndoBarProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

/** Dark bar at the bottom: "Removed Japan · Undo". Hides itself. */
export function UndoBar({ message, onUndo, onDismiss }: UndoBarProps) {
  const { colors, typography, radius, spacing, touchTarget } = useTheme();

  useEffect(() => {
    const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.ink,
          borderRadius: radius.md,
          margin: spacing.md,
          paddingLeft: spacing.md,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      testID="undo-bar"
    >
      <Feather name="trash-2" size={18} color={colors.onInk} />
      <Text
        style={[typography.label, styles.message, { color: colors.onInk }]}
        numberOfLines={1}
      >
        {message}
      </Text>
      <Pressable
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        style={[styles.undo, { minHeight: touchTarget, minWidth: touchTarget }]}
      >
        <Text style={[typography.label, { color: colors.accentYellow }]}>
          UNDO
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  message: { flex: 1 },
  undo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
