import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

/** Progress dots under the slides; the active one is a wider pill. */
export function PageDots({ count, active }: { count: number; active: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Page ${active + 1} of ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active
              ? [styles.active, { backgroundColor: colors.ink }]
              : { backgroundColor: colors.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  active: { width: 22 },
});
