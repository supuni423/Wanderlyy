import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  hasSeenOnboarding,
  markOnboardingSeen,
  resetOnboarding,
} from '../onboardingStorage';

describe('onboardingStorage', () => {
  beforeEach(() => AsyncStorage.clear());

  it('reports the intro as not seen on a fresh install', async () => {
    expect(await hasSeenOnboarding()).toBe(false);
  });

  it('remembers the intro once it is marked as seen', async () => {
    await markOnboardingSeen();
    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('shows the intro again after a reset', async () => {
    await markOnboardingSeen();
    await resetOnboarding();
    expect(await hasSeenOnboarding()).toBe(false);
  });

  it('falls back to showing the intro if storage fails', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('disk error'));
    expect(await hasSeenOnboarding()).toBe(false);
  });
});
