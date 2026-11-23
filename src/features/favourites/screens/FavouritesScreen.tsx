import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  COUNTRY_CARD_HEIGHT,
  CountryCard,
  type CountrySummary,
} from '@/features/countries';
import type { FavouritesStackScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';
import { UndoBar } from '../components/UndoBar';
import {
  restoreFavourite,
  selectFavourites,
  type FavouriteCountry,
} from '../favouritesSlice';

/**
 * The user's travel wishlist. Everything shown comes from the saved
 * favourites in Redux (persisted), so it works fully offline.
 * Removing a country offers a short Undo.
 */
export function FavouritesScreen({
  navigation,
}: FavouritesStackScreenProps<'Favourites'>) {
  const { colors, typography, spacing } = useTheme();
  const dispatch = useAppDispatch();
  const favourites = useAppSelector(selectFavourites);
  const [removed, setRemoved] = useState<FavouriteCountry | null>(null);

  const regions = [...new Set(favourites.map(f => f.region))].sort();

  const openCountry = useCallback(
    (code: string) => navigation.navigate('CountryDetails', { code }),
    [navigation],
  );

  const onFavouriteChange = useCallback(
    (country: CountrySummary, saved: boolean) => {
      if (!saved) {
        // Keep the full saved entry (with its date) so Undo can restore it.
        setRemoved(favourites.find(f => f.code === country.code) ?? null);
      }
    },
    [favourites],
  );

  const undo = useCallback(() => {
    if (removed) {
      dispatch(restoreFavourite(removed));
    }
    setRemoved(null);
  }, [dispatch, removed]);

  const dismissUndo = useCallback(() => setRemoved(null), []);

  const renderItem: ListRenderItem<FavouriteCountry> = useCallback(
    ({ item, index }) => (
      <CountryCard
        country={item}
        index={index}
        onPress={openCountry}
        onFavouriteChange={onFavouriteChange}
      />
    ),
    [openCountry, onFavouriteChange],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
        <Text
          style={[typography.display, { color: colors.text }]}
          accessibilityRole="header"
        >
          Your{' '}
          <Text style={[typography.accent, { color: colors.accentPurple }]}>
            wishlist
          </Text>
        </Text>
        {favourites.length > 0 && (
          <Text
            style={[
              typography.label,
              typography.accent,
              { color: colors.textMuted, marginTop: spacing.xs },
            ]}
          >
            {favourites.length}{' '}
            {favourites.length === 1 ? 'country' : 'countries'} saved ·{' '}
            {regions.join(', ')}
          </Text>
        )}
      </View>

      <FlatList
        data={favourites}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: COUNTRY_CARD_HEIGHT,
          offset: COUNTRY_CARD_HEIGHT * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="No favourites yet"
            message="Tap the heart on any country to save it here. Your wishlist works offline too."
            actionLabel="Explore countries"
            onAction={() =>
              navigation.navigate('HomeTab', { screen: 'Countries' })
            }
          />
        }
        testID="favourites-list"
      />

      {removed && (
        <UndoBar
          message={`Removed ${removed.name}`}
          onUndo={undo}
          onDismiss={dismissUndo}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingBottom: 96, flexGrow: 1 },
});
