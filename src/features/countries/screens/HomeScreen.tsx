import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EmptyState,
  ErrorState,
  LoadingIndicator,
  OfflineBanner,
  SearchBar,
} from '@/components';
import { useDebouncedValue } from '@/hooks';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth';
import { selectCachedCountryList, useNetworkStatus } from '@/features/offline';
import { formatTimeAgo } from '@/utils/format';
import type { HomeStackScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { useGetCountriesQuery } from '../countriesApi';
import { getCountriesErrorMessage } from '../countriesErrors';
import { COUNTRY_CARD_HEIGHT, CountryCard } from '../components/CountryCard';
import { RegionChips } from '../components/RegionChips';
import { filterCountries, type RegionFilter } from '../filterCountries';
import type { CountrySummary } from '../types';

/**
 * Home tab: every country as a card. Handles the four list states the
 * assignment asks for: loading, error (with retry), empty and data.
 * Offline-first: the last saved list is shown while loading or offline,
 * so loading/error screens only appear when nothing was ever saved.
 * Search (debounced) and region chips narrow the list. Pull to refresh.
 */
export function HomeScreen({ navigation }: HomeStackScreenProps<'Countries'>) {
  const { colors, typography, spacing } = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const { isOffline } = useNetworkStatus();
  const {
    data: live,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetCountriesQuery();
  // Offline-first: fall back to the saved copy when there is no live data.
  const cached = useAppSelector(selectCachedCountryList);
  const data = live ?? cached?.data;
  const showingSavedCopy = !live && !!cached;

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionFilter>('All');
  // Filter once typing pauses, not on every keystroke.
  const debouncedQuery = useDebouncedValue(query, 250);

  const countries = useMemo(
    () => filterCountries(data ?? [], { query: debouncedQuery, region }),
    [data, debouncedQuery, region],
  );
  const isFiltered = debouncedQuery.trim() !== '' || region !== 'All';

  const clearFilters = useCallback(() => {
    setQuery('');
    setRegion('All');
  }, []);

  // Used by both "Try again" and pull-to-refresh.
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openCountry = useCallback(
    (code: string) => navigation.navigate('CountryDetails', { code }),
    [navigation],
  );

  const renderItem: ListRenderItem<CountrySummary> = useCallback(
    ({ item, index }) => (
      <CountryCard country={item} index={index} onPress={openCountry} />
    ),
    [openCountry],
  );

  const header = (
    <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
      <Text style={[typography.body, { color: colors.textMuted }]}>
        Hello, {user?.firstName ?? 'traveller'}
      </Text>
      <Text
        style={[typography.display, { color: colors.text }]}
        accessibilityRole="header"
      >
        Discover{' '}
        <Text style={[typography.accent, { color: colors.primary }]}>
          the world
        </Text>
      </Text>
      {!!data && data.length > 0 && (
        <Text
          style={[
            typography.label,
            typography.accent,
            { color: colors.textMuted, marginTop: spacing.xs },
          ]}
          accessibilityLiveRegion="polite"
        >
          {isFiltered
            ? `${countries.length} of ${data.length} countries`
            : `${data.length} countries to explore`}
          {showingSavedCopy && cached
            ? ` · saved ${formatTimeAgo(cached.savedAt)}`
            : ''}
        </Text>
      )}
    </View>
  );

  const filters = !!data && data.length > 0 && (
    <View style={{ gap: spacing.xs, paddingBottom: spacing.sm }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by country, capital or code"
          accessibilityLabel="Search countries"
        />
      </View>
      <RegionChips selected={region} onSelect={setRegion} />
    </View>
  );

  let content;
  if (isLoading && !data) {
    content = <LoadingIndicator message="Finding countries…" />;
  } else if (error && !data) {
    content = (
      <ErrorState
        title="Couldn't load countries"
        message={getCountriesErrorMessage(error)}
        onRetry={retry}
        retrying={isFetching}
      />
    );
  } else {
    content = (
      <FlatList
        data={countries}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: COUNTRY_CARD_HEIGHT,
          offset: COUNTRY_CARD_HEIGHT * index,
          index,
        })}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isFiltered ? (
            <EmptyState
              icon="search"
              title="No matches"
              message={
                debouncedQuery.trim()
                  ? `Nothing matches "${debouncedQuery.trim()}"${
                      region === 'All' ? '' : ` in ${region}`
                    }.`
                  : `No countries in ${region}.`
              }
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon="globe"
              title="No countries yet"
              message="The country list came back empty. Pull down to try again."
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={retry}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        testID="country-list"
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <OfflineBanner
        visible={isOffline}
        message={
          data ? "You're offline. Showing saved countries." : "You're offline."
        }
        detail={
          cached
            ? `Country list saved ${formatTimeAgo(cached.savedAt)}`
            : 'Connect once to save the country list for offline use.'
        }
      />
      {header}
      {filters}
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
});
