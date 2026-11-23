import { useCallback, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingIndicator } from '@/components';
import { FavouriteButton } from '@/features/favourites/components/FavouriteButton';
import type { CountryDetailsParams } from '@/navigation/types';
import { useTheme } from '@/theme';
import {
  formatArea,
  formatCallingCodes,
  formatCompact,
  formatList,
  formatPopulation,
} from '@/utils/format';
import { countriesApi, useGetCountryByCodeQuery } from '../countriesApi';
import { getCountriesErrorMessage } from '../countriesErrors';
import {
  FactRow,
  FlagHero,
  NeighbourChip,
  Section,
  StatTile,
} from '../components/DetailsParts';
import { regionTone } from '../regionTone';
import type { CountryDetails } from '../types';

/** The same screen is registered in the Home and Favourites stacks. */
type DetailsStack = { CountryDetails: CountryDetailsParams };
type DetailsRoute = RouteProp<DetailsStack, 'CountryDetails'>;
type DetailsNavigation = NativeStackNavigationProp<DetailsStack>;

/**
 * Country details. Receives only the country code and loads everything
 * else itself (REST Countries /codes.alpha_3/{code}). While that loads,
 * the flag and name are shown straight away from the already-loaded list.
 */
export function CountryDetailsScreen() {
  const { params } = useRoute<DetailsRoute>();
  const navigation = useNavigation<DetailsNavigation>();
  const { colors, typography, spacing } = useTheme();
  const code = params.code;

  const { data, error, isLoading, isFetching, refetch } =
    useGetCountryByCodeQuery(code);

  // Read the Home list from the cache only (never triggers a request).
  const { data: list } = countriesApi.endpoints.getCountries.useQueryState();
  const summary = data ?? list?.find(c => c.code === code);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: summary?.name ?? 'Country',
      // Heart in the header once we know which country this is.
      headerRight: summary
        ? () => <FavouriteButton country={summary} variant="header" />
        : undefined,
    });
  }, [navigation, summary]);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  const nameOf = (borderCode: string) =>
    list?.find(c => c.code === borderCode)?.name ?? borderCode;

  const notFound = !!error && 'status' in error && error.status === 404;
  const loadError = error && !data && (
    <ErrorState
      icon={notFound ? 'map' : 'cloud-off'}
      title={notFound ? 'Country not found' : "Couldn't load this country"}
      message={getCountriesErrorMessage(error)}
      onRetry={notFound ? undefined : retry}
      retrying={isFetching}
    />
  );

  // Nothing to show at all (not in the list either): full-screen error.
  if (loadError && !summary) {
    return loadError;
  }

  if (!summary) {
    return <LoadingIndicator message="Opening the travel journal…" />;
  }

  const tone = regionTone(summary.region, colors);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { padding: spacing.lg, gap: spacing.lg },
      ]}
      testID="country-details"
    >
      <FlagHero country={summary} description={data?.flagDescription} />

      <View style={styles.titleBlock}>
        <Text
          style={[typography.display, styles.center, { color: colors.text }]}
          accessibilityRole="header"
        >
          {summary.name}
        </Text>
        {summary.officialName !== summary.name && (
          <Text
            style={[
              typography.body,
              typography.accent,
              styles.center,
              { color: colors.textMuted },
            ]}
          >
            {summary.officialName}
          </Text>
        )}
        <Text style={[typography.label, styles.center, { color: tone }]}>
          {[summary.region, summary.subregion].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <View style={[styles.tiles, { gap: spacing.sm }]}>
        <StatTile
          icon="map-pin"
          label="Capital"
          value={summary.capital ?? 'None'}
          tone={colors.primary}
        />
        <StatTile
          icon="users"
          label="Population"
          value={
            summary.population > 0 ? formatCompact(summary.population) : '—'
          }
          tone={colors.accentPurple}
        />
        <StatTile
          icon="maximize"
          label="Area"
          value={data?.areaKm2 ? `${formatCompact(data.areaKm2)} km²` : '—'}
          tone={colors.accentGreen}
        />
      </View>

      {/* Keep the flag and stats from the list; only the facts show the error. */}
      {loadError ? (
        <View style={styles.inlineError}>{loadError}</View>
      ) : isLoading || !data ? (
        <LoadingIndicator message="Loading more facts…" fullScreen={false} />
      ) : (
        <DetailsSections
          details={data}
          nameOf={nameOf}
          onOpenNeighbour={borderCode =>
            navigation.push('CountryDetails', { code: borderCode })
          }
        />
      )}
    </ScrollView>
  );
}

function DetailsSections({
  details,
  nameOf,
  onOpenNeighbour,
}: {
  details: CountryDetails;
  nameOf: (code: string) => string;
  onOpenNeighbour: (code: string) => void;
}) {
  const { colors, typography, spacing } = useTheme();
  const currencies = details.currencies.map(c =>
    [c.name || c.code, c.symbol ? `(${c.symbol})` : ''].join(' ').trim(),
  );
  const driving =
    details.drivingSide === null ? 'Unknown' : `On the ${details.drivingSide}`;

  return (
    <View style={{ gap: spacing.lg }}>
      <Section title="Travel essentials">
        <FactRow
          icon="message-circle"
          label="Languages"
          value={formatList(details.languages, 'Unknown')}
        />
        <FactRow
          icon="credit-card"
          label="Currency"
          value={formatList(currencies, 'Unknown')}
        />
        <FactRow
          icon="clock"
          label="Time zones"
          value={formatList(details.timezones, 'Unknown')}
        />
        <FactRow
          icon="phone"
          label="Calling code"
          value={
            details.callingCodes.length
              ? formatCallingCodes(details.callingCodes)
              : 'None'
          }
        />
        <FactRow icon="navigation" label="Driving" value={driving} last />
      </Section>

      <Section title="Good to know">
        <FactRow
          icon="users"
          label="Population"
          value={formatPopulation(details.population)}
        />
        <FactRow
          icon="maximize"
          label="Area"
          value={formatArea(details.areaKm2)}
        />
        <FactRow
          icon="smile"
          label="People"
          value={details.demonym ?? 'Unknown'}
        />
        <FactRow
          icon="globe"
          label="Continent"
          value={formatList(details.continents, 'Unknown')}
        />
        <FactRow
          icon="anchor"
          label="Coastline"
          value={details.landlocked ? 'Landlocked' : 'Has a coastline'}
        />
        <FactRow
          icon="at-sign"
          label="Web domain"
          value={formatList(details.tlds, 'None')}
          last
        />
      </Section>

      <View style={{ gap: spacing.sm }}>
        <Text
          style={[typography.h2, typography.accent, { color: colors.text }]}
          accessibilityRole="header"
        >
          Neighbours
        </Text>
        {details.borders.length === 0 ? (
          <Text style={[typography.body, { color: colors.textMuted }]}>
            No land borders: an island, or surrounded by sea.
          </Text>
        ) : (
          <View style={styles.chips}>
            {details.borders.map(borderCode => (
              <NeighbourChip
                key={borderCode}
                label={nameOf(borderCode)}
                onPress={() => onOpenNeighbour(borderCode)}
              />
            ))}
          </View>
        )}
      </View>

      {!!details.flagDescription && (
        <Section title="About the flag">
          <Text
            style={[
              typography.body,
              styles.flagText,
              { color: colors.textMuted },
            ]}
          >
            {details.flagDescription}
          </Text>
        </Section>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },
  titleBlock: { gap: 4 },
  center: { textAlign: 'center' },
  tiles: { flexDirection: 'row' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flagText: { paddingVertical: 14 },
  inlineError: { minHeight: 320 },
});
