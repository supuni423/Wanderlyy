import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { config } from '@/services/config';
import { toCountryDetails, toCountrySummaries } from './countryMapper';
import type {
  CountryDetails,
  CountrySummary,
  RawCountry,
  RawListResponse,
} from './types';

export const RESTCOUNTRIES_URL = 'https://api.restcountries.com/countries/v5';

/** Data older than this is refreshed on reconnect or when a screen opens. */
export const STALE_AFTER_SECONDS = 30 * 60;

/** Free plan allows at most 100 records per request (249 countries = 3). */
export const PAGE_SIZE = 100;
/** Safety stop so a server bug can never cause an endless request loop. */
const MAX_PAGES = 5;

/** Only what a Home card needs, so the list download stays small. */
export const LIST_FIELDS = [
  'names.common',
  'names.official',
  'codes.alpha_2',
  'codes.alpha_3',
  'capitals',
  'region',
  'subregion',
  'population',
  'flag.url_png',
  'flag.emoji',
].join(',');

/** Heavy or paid-plan branches the Details screen does not use. */
const DETAILS_OMIT = 'names.translations,leaders,economy';

export const MISSING_KEY_MESSAGE =
  'No REST Countries API key found. Add RESTCOUNTRIES_API_KEY to the .env file (see README).';

const fetchWithKey = fetchBaseQuery({
  baseUrl: RESTCOUNTRIES_URL,
  timeout: 15000,
  prepareHeaders: headers => {
    headers.set('Authorization', `Bearer ${config.restCountriesApiKey}`);
    return headers;
  },
});

/** Stops early with a clear message when the key is missing. */
const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) => {
  if (!config.restCountriesApiKey) {
    return { error: { status: 'CUSTOM_ERROR', error: MISSING_KEY_MESSAGE } };
  }
  return fetchWithKey(args, api, extraOptions);
};

const notFound = (code: string): FetchBaseQueryError => ({
  status: 404,
  data: { message: `No country found with code "${code}".` },
});

/**
 * REST Countries v5 (RTK Query).
 * - getCountries:     GET /countries/v5?limit=100&offset=… (all pages)
 * - getCountryByCode: GET /countries/v5/codes.alpha_3/{code}
 */
export const countriesApi = createApi({
  reducerPath: 'countriesApi',
  baseQuery,
  // Country data changes rarely; keep it for an hour after the last use.
  keepUnusedDataFor: 60 * 60,
  // Screens skip their queries while offline; when the connection
  // returns they resume and refresh only if the data is older than
  // 30 min (also when a screen opens). This protects the monthly quota.
  refetchOnMountOrArgChange: STALE_AFTER_SECONDS,
  endpoints: build => ({
    getCountries: build.query<CountrySummary[], void>({
      async queryFn(_arg, _api, _extra, fetchPage) {
        const records: RawCountry[] = [];
        for (let page = 0; page < MAX_PAGES; page++) {
          const result = await fetchPage({
            url: '',
            params: {
              limit: PAGE_SIZE,
              offset: page * PAGE_SIZE,
              response_fields: LIST_FIELDS,
            },
          });
          if (result.error) {
            return { error: result.error };
          }
          const body = result.data as RawListResponse;
          records.push(...(body.data?.objects ?? []));
          if (!body.data?.meta?.more) {
            break;
          }
        }
        return { data: toCountrySummaries(records) };
      },
    }),

    getCountryByCode: build.query<CountryDetails, string>({
      async queryFn(rawCode, _api, _extra, fetchOne) {
        const code = rawCode.trim().toUpperCase();
        if (!/^[A-Z]{3}$/.test(code)) {
          return { error: notFound(rawCode) };
        }
        const result = await fetchOne({
          url: `/codes.alpha_3/${code}`,
          params: { response_fields_omit: DETAILS_OMIT },
        });
        if (result.error) {
          return {
            error: result.error.status === 404 ? notFound(code) : result.error,
          };
        }
        const raw = (result.data as RawListResponse).data?.objects?.[0];
        const details = raw ? toCountryDetails(raw) : null;
        return details ? { data: details } : { error: notFound(code) };
      },
    }),
  }),
});

export const { useGetCountriesQuery, useGetCountryByCodeQuery } = countriesApi;
