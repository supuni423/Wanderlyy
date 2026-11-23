import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { AuthFlow, restoreSession, selectAuthStatus } from '@/features/auth';
import {
  OnboardingScreen,
  SplashScreen,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/features/onboarding';
import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from './hooks';
import { SignedInPlaceholder } from './SignedInPlaceholder';

/** Keep the splash up long enough to be seen, even on a fast phone. */
export const SPLASH_MIN_MS = 1200;

/**
 * App entry. The splash stays up until three things are done:
 * the minimum splash time, reading the "intro seen" flag, and
 * restoring the saved session from the Keychain. Then it shows the
 * intro (first launch), the auth screens, or the signed-in app.
 * React Navigation takes over in a later commit.
 */
export function EntryFlow() {
  const { mode } = useTheme();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const [seenIntro, setSeenIntro] = useState<boolean | null>(null);
  const [splashTimeUp, setSplashTimeUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dispatch(restoreSession());
    hasSeenOnboarding().then(seen => {
      if (!cancelled) {
        setSeenIntro(seen);
      }
    });
    const timer = setTimeout(() => setSplashTimeUp(true), SPLASH_MIN_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dispatch]);

  const finishOnboarding = useCallback(() => {
    markOnboardingSeen();
    setSeenIntro(true);
  }, []);

  const loading =
    !splashTimeUp || seenIntro === null || authStatus === 'checking';

  let screen;
  if (loading) {
    screen = <SplashScreen />;
  } else if (!seenIntro) {
    screen = <OnboardingScreen onDone={finishOnboarding} />;
  } else if (authStatus === 'authenticated') {
    screen = <SignedInPlaceholder />;
  } else {
    screen = <AuthFlow />;
  }

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {screen}
    </>
  );
}
