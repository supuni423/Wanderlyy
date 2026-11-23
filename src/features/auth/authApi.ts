import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { saveTokens } from './sessionStorage';
import type { LoginValues, RegisterValues } from './validation';
import {
  toUser,
  type LoginResponse,
  type RegisteredUser,
  type User,
} from './authTypes';

export const DUMMYJSON_URL = 'https://dummyjson.com';

/** How long a DummyJSON access token stays valid. */
export const TOKEN_LIFETIME_MINUTES = 60;

/**
 * DummyJSON auth endpoints (RTK Query).
 * - login:    POST /auth/login
 * - register: POST /users/add (DummyJSON simulates this: the user is
 *             returned but not saved, so it cannot be used to sign in)
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: DUMMYJSON_URL, timeout: 15000 }),
  endpoints: build => ({
    login: build.mutation<User, LoginValues>({
      async queryFn({ username, password }, _api, _extra, baseQuery) {
        const result = await baseQuery({
          url: '/auth/login',
          method: 'POST',
          body: { username, password, expiresInMins: TOKEN_LIFETIME_MINUTES },
        });
        if (result.error) {
          return { error: result.error };
        }
        const response = result.data as LoginResponse;

        // Tokens go to the Keychain only. Redux receives just the profile.
        const saved = await saveTokens(response);
        if (!saved) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Could not save your session securely. Please try again.',
            },
          };
        }
        return { data: toUser(response) };
      },
    }),
    register: build.mutation<RegisteredUser, RegisterValues>({
      query: ({ firstName, lastName, email, username, password }) => ({
        url: '/users/add',
        method: 'POST',
        body: { firstName, lastName, email, username, password },
      }),
      // The response echoes the password back: keep only what we show.
      transformResponse: (response: RegisteredUser) => ({
        id: response.id,
        username: response.username,
        firstName: response.firstName,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
