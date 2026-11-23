import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, selectCurrentUser } from '@/features/auth';
import { FactRow, Section, StatTile } from '@/features/countries';
import { clearFavourites, selectFavourites } from '@/features/favourites';
import {
  clearCountriesCache,
  MAX_CACHED_DETAILS,
  selectOfflineStorageSummary,
} from '@/features/offline';
import { formatTimeAgo } from '@/utils/format';
import { resetOnboarding } from '@/features/onboarding';
import { useTheme } from '@/theme';
import { version as APP_VERSION } from '../../../../package.json';
import { SettingsRow } from '../components/SettingsRow';
import { ThemeSelector } from '../components/ThemeSelector';

/**
 * Profile tab: who is signed in, a few travel stats from the wishlist,
 * app actions (clear favourites, replay intro), About, and log out.
 */
export function ProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const favourites = useAppSelector(selectFavourites);
  const offline = useAppSelector(selectOfflineStorageSummary);

  const regions = new Set(favourites.map(f => f.region)).size;
  const latest = favourites[0]?.name ?? '—';

  const confirmClearFavourites = () => {
    Alert.alert(
      'Clear your wishlist?',
      `This removes all ${favourites.length} saved countries from this phone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => dispatch(clearFavourites()),
        },
      ],
    );
  };

  const confirmClearOfflineData = () => {
    Alert.alert(
      'Clear offline data?',
      'Saved country data is removed from this phone. It downloads again next time you are online. Your favourites are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => dispatch(clearCountriesCache()),
        },
      ],
    );
  };

  const replayIntro = () => {
    resetOnboarding();
    Alert.alert(
      'Intro reset',
      'The welcome slides will show the next time you open Wanderlyy.',
    );
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'Your favourites stay saved on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
      testID="profile-screen"
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <View style={styles.header}>
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={[styles.avatar, { borderColor: colors.primary }]}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.initials,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryMuted,
                },
              ]}
            >
              <Text style={[typography.h1, { color: colors.primary }]}>
                {(user?.firstName ?? 'T').charAt(0)}
              </Text>
            </View>
          )}
          <Text
            style={[typography.h1, { color: colors.text }]}
            accessibilityRole="header"
          >
            {user ? `${user.firstName} ${user.lastName}` : 'Traveller'}
          </Text>
          {!!user && (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              @{user.username} · {user.email}
            </Text>
          )}
        </View>

        <View style={[styles.tiles, { gap: spacing.sm }]}>
          <StatTile
            icon="heart"
            label="Saved"
            value={String(favourites.length)}
            tone={colors.primary}
          />
          <StatTile
            icon="globe"
            label="Regions"
            value={String(regions)}
            tone={colors.accentPurple}
          />
          <StatTile
            icon="map-pin"
            label="Latest save"
            value={latest}
            tone={colors.accentGreen}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[typography.h2, typography.accent, { color: colors.text }]}
            accessibilityRole="header"
          >
            Appearance
          </Text>
          <ThemeSelector />
        </View>

        <Section title="Your travel journal">
          <SettingsRow
            icon="trash-2"
            label="Clear all favourites"
            hint={
              favourites.length
                ? `${favourites.length} saved on this phone`
                : 'Nothing saved yet'
            }
            onPress={confirmClearFavourites}
            destructive
            disabled={favourites.length === 0}
          />
          <SettingsRow
            icon="rotate-ccw"
            label="Replay the intro"
            hint="Shows the welcome slides next time"
            onPress={replayIntro}
            last
          />
        </Section>

        <Section title="Offline storage">
          <FactRow
            icon="list"
            label="Country list"
            value={
              offline.listSavedAt
                ? `${offline.countries} countries · saved ${formatTimeAgo(
                    offline.listSavedAt,
                  )}`
                : 'Not saved yet'
            }
          />
          <FactRow
            icon="download-cloud"
            label="Country pages"
            value={`${offline.pages} saved (keeps up to ${MAX_CACHED_DETAILS})`}
          />
          <SettingsRow
            icon="trash"
            label="Clear offline data"
            hint="Favourites are kept"
            onPress={confirmClearOfflineData}
            destructive
            disabled={offline.pages === 0 && !offline.listSavedAt}
            last
          />
        </Section>

        <Section title="About">
          <FactRow icon="globe" label="Country data" value="REST Countries" />
          <FactRow icon="lock" label="Sign-in" value="DummyJSON" />
          <FactRow
            icon="shield"
            label="Security"
            value="Session kept in the encrypted Keychain"
          />
          <FactRow icon="info" label="Version" value={APP_VERSION} last />
        </Section>

        <AppButton
          title="Log out"
          icon="log-out"
          variant="outline"
          onPress={confirmLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR = 96;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: 'center', gap: 4, paddingTop: 8 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 3,
    marginBottom: 8,
  },
  initials: { alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row' },
});
