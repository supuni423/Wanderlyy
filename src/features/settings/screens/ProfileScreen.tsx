import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components';
import { logout, selectCurrentUser } from '@/features/auth';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useTheme } from '@/theme';

/** Profile tab: who is signed in, and log out. Settings are added later. */
export function ProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.center}>
        {!!user?.image && (
          <Image
            source={{ uri: user.image }}
            style={[styles.avatar, { borderColor: colors.primary }]}
            accessibilityIgnoresInvertColors
          />
        )}
        <Text style={[typography.h1, { color: colors.text }]}>
          {user ? `${user.firstName} ${user.lastName}` : 'Traveller'}
        </Text>
        {!!user && (
          <Text style={[typography.body, { color: colors.textMuted }]}>
            @{user.username} · {user.email}
          </Text>
        )}
        <AppButton
          title="Log out"
          icon="log-out"
          variant="outline"
          onPress={() => dispatch(logout())}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    marginBottom: 12,
  },
});
