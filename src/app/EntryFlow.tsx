import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { restoreSession, selectAuthStatus } from '@/features/auth';
import {
  OnboardingScreen,
  SplashScreen,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/features/onboarding';
import { ReconnectToast, startNetworkMonitor } from '@/features/offline';
import { RootNavigator } from '@/navigation';
import { useTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from './hooks';

/** Keep the splash up long enough to be seen, even on a fast phone. */
export const SPLASH_MIN_MS = 1200;

/**
 * App entry. The splash stays up until three things are done:
 * the minimum splash time, reading the "intro seen" flag, and
 * restoring the saved session from the Keychain. Then it shows the
 * intro (first launch) or the navigator (auth stack or tabs).
 */
export function EntryFlow() {
  const { mode } = useTheme();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const [seenIntro, setSeenIntro] = useState<boolean | null>(null);
  const [splashTimeUp, setSplashTimeUp] = useState(false);

  // Follow the connection for the whole life of the app (also tells
  // RTK Query when the phone comes back online, so data refreshes).
  useEffect(() => startNetworkMonitor(dispatch), [dispatch]);

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
  } else {
    screen = <RootNavigator />;
  }

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {screen}
      {!loading && <ReconnectToast />}
    </>
  );
}
