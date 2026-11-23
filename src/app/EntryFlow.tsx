import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { AuthFlow, selectAuthStatus } from '@/features/auth';
import {
  OnboardingScreen,
  SplashScreen,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/features/onboarding';
import { useTheme } from '@/theme';
import { useAppSelector } from './hooks';
import { SignedInPlaceholder } from './SignedInPlaceholder';

type Stage = 'splash' | 'onboarding' | 'auth';

/** Keep the splash up long enough to be seen, even on a fast phone. */
export const SPLASH_MIN_MS = 1200;

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * App entry: splash, then the intro slides on first launch, then the
 * auth screens, or the signed-in app once the user has logged in.
 * React Navigation takes over in a later commit.
 */
export function EntryFlow() {
  const { mode } = useTheme();
  const [stage, setStage] = useState<Stage>('splash');
  const authStatus = useAppSelector(selectAuthStatus);

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

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {stage === 'splash' && <SplashScreen />}
      {stage === 'onboarding' && <OnboardingScreen onDone={finishOnboarding} />}
      {stage === 'auth' &&
        (authStatus === 'authenticated' ? (
          <SignedInPlaceholder />
        ) : (
          <AuthFlow />
        ))}
    </>
  );
}
