import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { getApiErrorMessage } from '@/services/api/errors';

/** User-facing messages for REST Countries v5 failures. */
export function getCountriesErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string | undefined {
  return getApiErrorMessage(error, {
    byStatus: {
      401: 'The REST Countries API key is missing or invalid.',
      403: 'The monthly REST Countries request limit has been reached.',
      404: 'We could not find that country.',
      429: 'Too many requests. Please wait a moment and try again.',
    },
    fallback: 'Could not load countries. Please try again.',
  });
}
