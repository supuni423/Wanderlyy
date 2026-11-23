import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { REGION_FILTERS, type RegionFilter } from '../filterCountries';
import { regionTone } from '../regionTone';

interface RegionChipsProps {
  selected: RegionFilter;
  onSelect: (region: RegionFilter) => void;
}

/** Horizontally scrolling region filter. One chip is always selected. */
export function RegionChips({ selected, onSelect }: RegionChipsProps) {
  const { colors, typography, touchTarget, spacing } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="tablist"
    >
      {REGION_FILTERS.map(region => {
        const active = region === selected;
        const tone = region === 'All' ? colors.ink : regionTone(region, colors);
        return (
          // The Pressable is 48dp tall; the visible pill sits inside it.
          <Pressable
            key={region}
            onPress={() => onSelect(region)}
            accessibilityRole="tab"
            accessibilityLabel={region === 'All' ? 'All regions' : region}
            accessibilityState={{ selected: active }}
            style={[styles.target, { minHeight: touchTarget }]}
          >
            <View
              style={[
                styles.pill,
                {
                  borderColor: tone,
                  backgroundColor: active ? tone : colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  { color: active ? colors.background : tone },
                ]}
              >
                {region}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  target: { justifyContent: 'center' },
  pill: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
