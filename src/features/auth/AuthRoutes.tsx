import { Alert } from 'react-native';
import type { AuthStackScreenProps } from '@/navigation/types';
import { getApiErrorMessage } from '@/services/api/errors';
import { useLoginMutation, useRegisterMutation } from './authApi';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import type { LoginValues, RegisterValues } from './validation';

/**
 * Navigator-facing wrappers: they connect the presentational screens to
 * DummyJSON and to the auth stack. A successful login updates the auth
 * slice, and the root navigator then swaps the auth stack for the tabs.
 */

export function LoginRoute({ navigation }: AuthStackScreenProps<'Login'>) {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = (values: LoginValues) => {
    // The error (if any) is shown from the mutation state.
    login(values).catch(() => undefined);
  };

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onGoToRegister={() => navigation.navigate('Register')}
      submitting={isLoading}
      errorMessage={getApiErrorMessage(error, {
        badRequest: 'Wrong username or password.',
      })}
    />
  );
}

export function RegisterRoute({
  navigation,
}: AuthStackScreenProps<'Register'>) {
  const [register, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async (values: RegisterValues) => {
    try {
      const user = await register(values).unwrap();
      Alert.alert(
        `Welcome, ${user.firstName}!`,
        'Your account was created. DummyJSON is a demo API and does not ' +
          'keep new accounts, so sign in with the demo account to explore.',
        [{ text: 'Go to sign in', onPress: () => navigation.popTo('Login') }],
      );
    } catch {
      // Shown from the mutation state.
    }
  };

  return (
    <RegisterScreen
      onSubmit={handleRegister}
      onGoToLogin={() => navigation.popTo('Login')}
      submitting={isLoading}
      errorMessage={getApiErrorMessage(error, {
        fallback: 'Could not create your account. Please try again.',
      })}
    />
  );
}
