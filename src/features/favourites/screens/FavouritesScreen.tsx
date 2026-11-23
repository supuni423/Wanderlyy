import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { EmptyState } from '@/components';
import type { FavouritesStackScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

/**
 * Favourites tab. Saving favourites (Redux + persistence) is added in
 * later commits; until then the list is always empty.
 */
export function FavouritesScreen({
  navigation,
}: FavouritesStackScreenProps<'Favourites'>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <EmptyState
        icon="heart"
        title="No favourites yet"
        message="Tap the heart on any country to save it here."
        actionLabel="Explore countries"
        onAction={() => navigation.navigate('HomeTab', { screen: 'Countries' })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
