import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { formatCompact } from '@/utils/format';
import { regionTone } from '../regionTone';
import type { CountrySummary } from '../types';

/** Fixed height so the list can use getItemLayout (smooth fast scrolling). */
export const COUNTRY_CARD_HEIGHT = 104;

interface CountryCardProps {
  country: CountrySummary;
  onPress: (code: string) => void;
  /** Alternates the flag's tilt so the list feels hand-made. */
  index?: number;
}

function CountryCardBase({ country, onPress, index = 0 }: CountryCardProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const tone = regionTone(country.region, colors);
  const tilt = index % 2 === 0 ? '-3deg' : '2deg';

  const label = [
    country.name,
    country.capital ? `capital ${country.capital}` : 'no capital',
    country.region,
    country.population > 0
      ? `population ${formatCompact(country.population)}`
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => onPress(country.code)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens the country details"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginHorizontal: spacing.md,
          shadowColor: colors.shadow,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.polaroid,
          { backgroundColor: colors.paper, transform: [{ rotate: tilt }] },
        ]}
      >
        {country.flagUrl ? (
          <Image
            source={{ uri: country.flagUrl }}
            style={styles.flag}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={styles.emoji}>{country.flagEmoji || '🏳️'}</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[typography.h2, { color: colors.text }]} numberOfLines={1}>
          {country.name}
        </Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={13} color={colors.textMuted} />
          <Text
            style={[typography.caption, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {country.capital ?? 'No capital'}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.chip, { borderColor: tone }]}>
            <Text style={[styles.chipText, { color: tone }]}>
              {country.region}
            </Text>
          </View>
          {country.population > 0 && (
            <View style={styles.row}>
              <Feather name="users" size={13} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {formatCompact(country.population)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Feather name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

/** Memoised: only re-renders when its own country changes. */
export const CountryCard = memo(CountryCardBase);

const styles = StyleSheet.create({
  card: {
    height: COUNTRY_CARD_HEIGHT - 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  polaroid: {
    width: 76,
    height: 56,
    padding: 4,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  flag: { width: '100%', height: '100%', borderRadius: 2 },
  emoji: { fontSize: 30 },
  body: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  chipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
