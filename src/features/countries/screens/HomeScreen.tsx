import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components';
import type { HomeStackScreenProps } from '@/navigation/types';
import { selectCurrentUser } from '@/features/auth';
import { useAppSelector } from '@/app/hooks';
import { useTheme } from '@/theme';

/**
 * Home tab. The country list (REST Countries + RTK Query) is built in the
 * next commits; for now this screen proves the typed Home -> Details flow.
 */
export function HomeScreen({ navigation }: HomeStackScreenProps<'Countries'>) {
  const { colors, typography, spacing } = useTheme();
  const user = useAppSelector(selectCurrentUser);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Hello, {user?.firstName ?? 'traveller'}
        </Text>
        <Text
          style={[typography.display, { color: colors.text }]}
          accessibilityRole="header"
        >
          Discover{'\n'}
          <Text style={[typography.accent, { color: colors.primary }]}>
            the world
          </Text>
        </Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Country cards arrive in the next step. Try the details screen:
        </Text>
        <AppButton
          title="Open Japan"
          icon="map-pin"
          variant="ink"
          onPress={() => navigation.navigate('CountryDetails', { code: 'JPN' })}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
