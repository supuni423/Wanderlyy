import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { REGION_FILTERS, type RegionFilter } from '../filterCountries';
import { regionTone } from '../regionTone';

interface RegionChipsProps {
  selected: RegionFilter;
  onSelect: (region: RegionFilter) => void;
  /** How many full pages are saved; the toggle hides when 0. */
  savedCount?: number;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
}

/** Horizontally scrolling region filter. One chip is always selected. */
export function RegionChips({
  selected,
  onSelect,
  savedCount = 0,
  savedOnly = false,
  onToggleSavedOnly,
}: RegionChipsProps) {
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
      {savedCount > 0 && onToggleSavedOnly && (
        <Pressable
          onPress={onToggleSavedOnly}
          accessibilityRole="switch"
          accessibilityLabel={`Only countries saved for offline, ${savedCount}`}
          accessibilityState={{ checked: savedOnly }}
          style={[styles.target, { minHeight: touchTarget }]}
        >
          <View
            style={[
              styles.pill,
              styles.savedPill,
              {
                borderColor: colors.accentGreen,
                backgroundColor: savedOnly
                  ? colors.accentGreen
                  : colors.surface,
              },
            ]}
          >
            <Feather
              name="download-cloud"
              size={14}
              color={savedOnly ? colors.background : colors.accentGreen}
            />
            <Text
              style={[
                typography.label,
                { color: savedOnly ? colors.background : colors.accentGreen },
              ]}
            >
              Saved ({savedCount})
            </Text>
          </View>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  target: { justifyContent: 'center' },
  savedPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
