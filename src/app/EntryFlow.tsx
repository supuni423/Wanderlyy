import { useCallback, useEffect, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { LoginScreen, RegisterScreen } from '@/features/auth';
import {
  OnboardingScreen,
  SplashScreen,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/features/onboarding';
import { useTheme } from '@/theme';

type Stage = 'splash' | 'onboarding' | 'auth';
type AuthScreen = 'login' | 'register';

/** Keep the splash up long enough to be seen, even on a fast phone. */
export const SPLASH_MIN_MS = 1200;

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * App entry: splash, then the intro slides on first launch, then the
 * auth screens. Switching between login and register is local state
 * for now; React Navigation takes over in a later commit.
 */
export function EntryFlow() {
  const { mode } = useTheme();
  const [stage, setStage] = useState<Stage>('splash');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  useEffect(() => {
    let cancelled = false;
    Promise.all([hasSeenOnboarding(), wait(SPLASH_MIN_MS)]).then(([seen]) => {
      if (!cancelled) {
        setStage(seen ? 'auth' : 'onboarding');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finishOnboarding = useCallback(() => {
    markOnboardingSeen();
    setStage('auth');
  }, []);

  // Temporary until the DummyJSON API is connected (commit 09).
  const notConnectedYet = useCallback(() => {
    Alert.alert('Almost there', 'Signing in is connected in the next steps.');
  }, []);

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {stage === 'splash' && <SplashScreen />}
      {stage === 'onboarding' && <OnboardingScreen onDone={finishOnboarding} />}
      {stage === 'auth' && authScreen === 'login' && (
        <LoginScreen
          onSubmit={notConnectedYet}
          onGoToRegister={() => setAuthScreen('register')}
        />
      )}
      {stage === 'auth' && authScreen === 'register' && (
        <RegisterScreen
          onSubmit={notConnectedYet}
          onGoToLogin={() => setAuthScreen('login')}
        />
      )}
    </>
  );
}
