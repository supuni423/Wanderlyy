import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type ApiError = FetchBaseQueryError | SerializedError | undefined;

interface ErrorMessages {
  /** Shown for 400/401 responses, e.g. "Wrong username or password". */
  badRequest?: string;
  /** Messages for specific HTTP statuses (checked before badRequest). */
  byStatus?: Partial<Record<number, string>>;
  fallback?: string;
}

export const NETWORK_ERROR_MESSAGE =
  "Can't reach the server. Check your internet connection and try again.";

/** Turns an RTK Query error into one short sentence for the user. */
export function getApiErrorMessage(
  error: ApiError,
  messages: ErrorMessages = {},
): string | undefined {
  if (!error) {
    return undefined;
  }
  const fallback =
    messages.fallback ?? 'Something went wrong. Please try again.';

  if (!('status' in error)) {
    return fallback;
  }
  if (error.status === 'CUSTOM_ERROR') {
    return error.error;
  }
  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return NETWORK_ERROR_MESSAGE;
  }
  if (typeof error.status === 'number' && messages.byStatus?.[error.status]) {
    return messages.byStatus[error.status];
  }
  if (error.status === 400 || error.status === 401) {
    return messages.badRequest ?? serverMessage(error) ?? fallback;
  }
  return fallback;
}

function serverMessage(error: FetchBaseQueryError): string | undefined {
  const data = error.data as { message?: unknown } | undefined;
  return typeof data?.message === 'string' ? data.message : undefined;
}
