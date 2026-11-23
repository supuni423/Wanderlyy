import { RESTCOUNTRIES_API_KEY } from '@env';

/**
 * Build-time configuration. The REST Countries key comes from the
 * git-ignored .env file (see .env.example), so it is never committed.
 */
export const config = {
  restCountriesApiKey: RESTCOUNTRIES_API_KEY?.trim() || undefined,
};
