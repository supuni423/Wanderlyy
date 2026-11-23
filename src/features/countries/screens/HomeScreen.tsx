import { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingIndicator } from '@/components';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth';
import type { HomeStackScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { useGetCountriesQuery } from '../countriesApi';
import { getCountriesErrorMessage } from '../countriesErrors';
import { COUNTRY_CARD_HEIGHT, CountryCard } from '../components/CountryCard';
import type { CountrySummary } from '../types';

/**
 * Home tab: every country as a card. Handles the four list states the
 * assignment asks for: loading, error (with retry), empty and data.
 * Pull down to refresh.
 */
export function HomeScreen({ navigation }: HomeStackScreenProps<'Countries'>) {
  const { colors, typography, spacing } = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const { data, error, isLoading, isFetching, refetch } =
    useGetCountriesQuery();

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
    <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
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
        >
          {data.length} countries to explore
        </Text>
      )}
    </View>
  );

  let content;
  if (isLoading) {
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
        data={data ?? []}
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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="globe"
            title="No countries yet"
            message="The country list came back empty. Pull down to try again."
          />
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
      {header}
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
});
