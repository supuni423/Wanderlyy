import { useCallback, useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  OnboardingScreen,
  SplashScreen,
  hasSeenOnboarding,
  markOnboardingSeen,
  resetOnboarding,
} from '@/features/onboarding';
import { getButtonStyles, useTheme } from '@/theme';

type Stage = 'splash' | 'onboarding' | 'ready';

/** Keep the splash up long enough to be seen, even on a fast phone. */
export const SPLASH_MIN_MS = 1200;

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * App entry: splash, then the intro slides on first launch, then the
 * main app. The "ready" stage is a placeholder until the login screen
 * and navigation are added in later commits.
 */
export function EntryFlow() {
  const { mode } = useTheme();
  const [stage, setStage] = useState<Stage>('splash');

  useEffect(() => {
    let cancelled = false;
    Promise.all([hasSeenOnboarding(), wait(SPLASH_MIN_MS)]).then(([seen]) => {
      if (!cancelled) {
        setStage(seen ? 'ready' : 'onboarding');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finishOnboarding = useCallback(() => {
    markOnboardingSeen();
    setStage('ready');
  }, []);

  const replayOnboarding = useCallback(() => {
    resetOnboarding();
    setStage('onboarding');
  }, []);

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      {stage === 'splash' && <SplashScreen />}
      {stage === 'onboarding' && <OnboardingScreen onDone={finishOnboarding} />}
      {stage === 'ready' && <ReadyPlaceholder onReplay={replayOnboarding} />}
    </>
  );
}

function ReadyPlaceholder({ onReplay }: { onReplay: () => void }) {
  const theme = useTheme();
  const { colors, typography, spacing } = theme;
  const button = getButtonStyles(theme, 'outline');
  return (
    <View style={[styles.ready, { backgroundColor: colors.background }]}>
      <Text style={[typography.h1, { color: colors.text }]}>
        You're all{' '}
        <Text style={[typography.accent, { color: colors.primary }]}>set</Text>
      </Text>
      <Text
        style={[
          typography.body,
          styles.readyText,
          { color: colors.textMuted, marginVertical: spacing.md },
        ]}
      >
        Sign in comes in the next build step.
      </Text>
      <Pressable
        onPress={onReplay}
        accessibilityRole="button"
        style={button.container}
      >
        <Text style={button.label}>Replay intro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ready: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  readyText: { textAlign: 'center' },
});
