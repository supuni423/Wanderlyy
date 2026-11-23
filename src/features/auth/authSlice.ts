import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import type { User } from './authTypes';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  /** Public profile only. Tokens are never kept in Redux. */
  user: User | null;
}

const initialState: AuthState = {
  status: 'unauthenticated',
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedOut: () => initialState,
  },
  extraReducers: builder => {
    builder.addMatcher(
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

type WithAuth = { auth: AuthState };
export const selectAuthStatus = (state: WithAuth) => state.auth.status;
export const selectCurrentUser = (state: WithAuth) => state.auth.user;
