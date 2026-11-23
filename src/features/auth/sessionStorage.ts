import * as Keychain from 'react-native-keychain';
import { z } from 'zod';
import type { AuthTokens } from './authTypes';

/**
 * Secure session storage. The access + refresh tokens are saved as one
 * JSON string in the Keychain (iOS) / Keystore-encrypted storage
 * (Android). They are never written to AsyncStorage, MMKV or Redux.
 */
export const SESSION_SERVICE = 'com.wanderlyy.session';

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

/** Saves the tokens. Returns false if the secure store is unavailable. */
export async function saveTokens(tokens: AuthTokens): Promise<boolean> {
  try {
    const stored = JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    const result = await Keychain.setGenericPassword('session', stored, {
      service: SESSION_SERVICE,
      // Only readable while the phone is unlocked, never synced/backed up.
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return result !== false;
  } catch {
    return false;
  }
}

/** Reads the saved tokens, or null if there are none or they are damaged. */
export async function loadTokens(): Promise<AuthTokens | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SESSION_SERVICE,
    });
    return credentials ? parseTokens(credentials.password) : null;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
  } catch {
    // Nothing stored or store unavailable: either way there is no session.
  }
}

/** Validates the stored JSON so a damaged entry is treated as "no session". */
export function parseTokens(raw: string): AuthTokens | null {
  try {
    const result = tokensSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
