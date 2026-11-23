import { DUMMYJSON_URL, TOKEN_LIFETIME_MINUTES } from './authApi';
import {
  toUser,
  type AuthTokens,
  type LoginResponse,
  type User,
} from './authTypes';

/**
 * Plain fetch calls used to restore a saved session at start-up.
 * They run outside RTK Query on purpose: refreshed tokens go straight
 * to the Keychain and never pass through the Redux store.
 */

/** "unauthorized": the token was rejected. "network": try again later. */
export class SessionError extends Error {
  constructor(readonly kind: 'unauthorized' | 'network') {
    super(kind === 'unauthorized' ? 'Session expired' : 'Network problem');
    this.name = 'SessionError';
  }
}

const TIMEOUT_MS = 15000;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${DUMMYJSON_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    // No connection, DNS failure or timeout.
    throw new SessionError('network');
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 401 || response.status === 403) {
    throw new SessionError('unauthorized');
  }
  if (!response.ok) {
    // 5xx and other surprises: the session may still be fine.
    throw new SessionError('network');
  }
  return (await response.json()) as T;
}

/** GET /auth/me. Only profile fields are kept (the response has far more). */
export async function fetchCurrentUser(accessToken: string): Promise<User> {
  const me = await request<LoginResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return toUser(me);
}

/** POST /auth/refresh: swaps a refresh token for a new token pair. */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken,
      expiresInMins: TOKEN_LIFETIME_MINUTES,
    }),
  });
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}
