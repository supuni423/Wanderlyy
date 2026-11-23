/** The signed-in user's public profile: the only auth data kept in Redux. */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

/** Tokens returned by DummyJSON. Never stored in Redux or AsyncStorage. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Raw POST /auth/login response (profile + tokens in one object). */
export type LoginResponse = User & AuthTokens & { gender?: string };

/** The parts of POST /users/add we keep (it also echoes the password). */
export interface RegisteredUser {
  id: number;
  username: string;
  firstName: string;
}

/**
 * Copies only the profile fields. Spreading the whole response would
 * also copy accessToken / refreshToken into the store.
 */
export function toUser(response: LoginResponse): User {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    image: response.image,
  };
}
