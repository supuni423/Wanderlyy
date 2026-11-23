import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import type { User } from './authTypes';
import { fetchCurrentUser, refreshTokens, SessionError } from './sessionApi';
import { clearTokens, loadTokens, saveTokens } from './sessionStorage';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  /** "checking" while the saved session is read at start-up. */
  status: AuthStatus;
  /** Public profile only. Tokens are never kept in Redux. */
  user: User | null;
}

const initialState: AuthState = {
  status: 'checking',
  user: null,
};

type RestoreResult =
  | { status: 'authenticated'; user: User | null }
  | { status: 'unauthenticated' };

const isNetworkError = (error: unknown) =>
  error instanceof SessionError && error.kind === 'network';

/**
 * Runs once at start-up:
 * 1. No tokens in the Keychain -> signed out.
 * 2. Access token still valid -> signed in, profile refreshed.
 * 3. Access token expired -> use the refresh token, save the new pair.
 * 4. Refresh token rejected -> clear the Keychain, signed out.
 * Offline at any step -> stay signed in (offline-first); the profile is
 * refreshed the next time the app starts with a connection.
 */
export const restoreSession = createAsyncThunk<RestoreResult>(
  'auth/restoreSession',
  async () => {
    const tokens = await loadTokens();
    if (!tokens) {
      return { status: 'unauthenticated' };
    }

    try {
      return {
        status: 'authenticated',
        user: await fetchCurrentUser(tokens.accessToken),
      };
    } catch (error) {
      if (isNetworkError(error)) {
        return { status: 'authenticated', user: null };
      }
    }

    // The access token was rejected: try the refresh token once.
    try {
      const fresh = await refreshTokens(tokens.refreshToken);
      await saveTokens(fresh);
      return {
        status: 'authenticated',
        user: await fetchCurrentUser(fresh.accessToken),
      };
    } catch (error) {
      if (isNetworkError(error)) {
        return { status: 'authenticated', user: null };
      }
      await clearTokens();
      return { status: 'unauthenticated' };
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedOut: () => ({ status: 'unauthenticated', user: null } as AuthState),
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.status = payload.status;
        if (payload.status === 'authenticated') {
          // Offline restore returns no profile: keep whatever we had.
          state.user = payload.user ?? state.user;
        } else {
          state.user = null;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.status = 'unauthenticated';
        state.user = null;
      })
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.status = 'authenticated';
          state.user = payload;
        },
      );
  },
});

export const { signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

/** Deletes the tokens from the Keychain, then clears auth + API cache. */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    await clearTokens();
    dispatch(signedOut());
    dispatch(authApi.util.resetApiState());
  },
);

type WithAuth = { auth: AuthState };
export const selectAuthStatus = (state: WithAuth) => state.auth.status;
export const selectCurrentUser = (state: WithAuth) => state.auth.user;
