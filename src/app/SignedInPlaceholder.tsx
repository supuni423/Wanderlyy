import { Image, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components';
import { authApi, selectCurrentUser, signedOut } from '@/features/auth';
import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from './hooks';

/**
 * Temporary signed-in screen that proves the DummyJSON login works.
 * Replaced by the Home / Favourites tabs once navigation is added.
 */
export function SignedInPlaceholder() {
  const { colors, typography, spacing } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const logOut = () => {
    dispatch(signedOut());
    dispatch(authApi.util.resetApiState());
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {!!user?.image && (
        <Image
          source={{ uri: user.image }}
          style={[styles.avatar, { borderColor: colors.primary }]}
          accessibilityIgnoresInvertColors
        />
      )}
      <Text style={[typography.h1, { color: colors.text }]}>
        Hi,{' '}
        <Text style={[typography.accent, { color: colors.primary }]}>
          {user?.firstName}
        </Text>
      </Text>
      <Text
        style={[
          typography.body,
          styles.center,
          { color: colors.textMuted, marginVertical: spacing.md },
        ]}
      >
        Signed in as @{user?.username}. Countries arrive in the next steps.
      </Text>
      <AppButton
        title="Log out"
        icon="log-out"
        variant="outline"
        onPress={logOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    marginBottom: 16,
  },
  center: { textAlign: 'center' },
});
