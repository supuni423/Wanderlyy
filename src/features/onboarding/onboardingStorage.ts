import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Remembers whether the intro slides were already shown.
 * This is a harmless UI flag, so AsyncStorage is fine here
 * (auth tokens go to the Keychain instead).
 */
export const ONBOARDING_KEY = 'wanderlyy/onboarding-seen';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    // If storage can't be read, showing the intro again is the safe fallback.
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Not critical: worst case the intro shows once more next launch.
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Ignore: nothing to undo.
  }
}
