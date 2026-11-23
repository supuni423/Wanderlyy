import { StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { CountryDetailsParams } from '@/navigation/types';
import { useTheme } from '@/theme';

/** Route type shared by the Home and Favourites stacks (same params). */
type DetailsRoute = RouteProp<
  { CountryDetails: CountryDetailsParams },
  'CountryDetails'
>;

/**
 * Country details. It only receives the country code and will load
 * everything else itself (REST Countries /alpha/{code}) in a later commit.
 */
export function CountryDetailsScreen() {
  const { params } = useRoute<DetailsRoute>();
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.screen, { padding: spacing.lg }]}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Country code
      </Text>
      <Text
        style={[
          typography.display,
          typography.accent,
          { color: colors.primary },
        ]}
      >
        {params.code}
      </Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>
        Full country details are loaded from this code in a later step.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 8 },
});
