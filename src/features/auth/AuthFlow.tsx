import { useState } from 'react';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '@/services/api/errors';
import { useLoginMutation, useRegisterMutation } from './authApi';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import type { LoginValues, RegisterValues } from './validation';

/**
 * Connects the login / register screens to DummyJSON.
 * A successful login updates the auth slice (see authSlice), which
 * moves the app to the signed-in screens. React Navigation replaces
 * the local screen switch in a later commit.
 */
export function AuthFlow() {
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();

  const handleLogin = (values: LoginValues) => {
    // Errors are shown from loginState; nothing else to do on failure.
    login(values).catch(() => undefined);
  };

  const handleRegister = async (values: RegisterValues) => {
    try {
      const user = await register(values).unwrap();
      Alert.alert(
        `Welcome, ${user.firstName}!`,
        'Your account was created. DummyJSON is a demo API and does not ' +
          'keep new accounts, so sign in with the demo account to explore.',
        [{ text: 'Go to sign in', onPress: () => setScreen('login') }],
      );
    } catch {
      // Shown from registerState.
    }
  };

  const goTo = (next: 'login' | 'register') => {
    loginState.reset();
    registerState.reset();
    setScreen(next);
  };

  if (screen === 'register') {
    return (
      <RegisterScreen
        onSubmit={handleRegister}
        onGoToLogin={() => goTo('login')}
        submitting={registerState.isLoading}
        errorMessage={getApiErrorMessage(registerState.error, {
          fallback: 'Could not create your account. Please try again.',
        })}
      />
    );
  }

  return (
    <LoginScreen
      onSubmit={handleLogin}
      onGoToRegister={() => goTo('register')}
      submitting={loginState.isLoading}
      errorMessage={getApiErrorMessage(loginState.error, {
        badRequest: 'Wrong username or password.',
      })}
    />
  );
}
