import { makeStore } from '@/app/store';
import { config } from '@/services/config';
import {
  countriesApi,
  LIST_FIELDS,
  MISSING_KEY_MESSAGE,
} from '../countriesApi';
import { getCountriesErrorMessage } from '../countriesErrors';
import type { RawCountry } from '../types';

const country = (code: string, name: string): RawCountry => ({
  names: { common: name },
  codes: { alpha_3: code },
});

const page = (objects: RawCountry[], more: boolean) => ({
  data: { objects, meta: { count: objects.length, more } },
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function mockFetch(...responses: Response[]) {
  const spy = jest.spyOn(globalThis, 'fetch');
  responses.forEach(r => spy.mockResolvedValueOnce(r));
  return spy;
}

const requestOf = (spy: jest.SpyInstance, call = 0) =>
  spy.mock.calls[call][0] as Request;

const originalKey = config.restCountriesApiKey;
beforeEach(() => {
  config.restCountriesApiKey = 'test-key';
});
afterEach(() => {
  config.restCountriesApiKey = originalKey;
  jest.restoreAllMocks();
});

describe('getCountries', () => {
  it('loads every page and returns one sorted list', async () => {
    const spy = mockFetch(
      json(200, page([country('JPN', 'Japan')], true)),
      json(200, page([country('AUT', 'Austria')], true)),
      json(200, page([country('BRA', 'Brazil')], false)),
    );
    const store = makeStore();

    const result = await store.dispatch(
      countriesApi.endpoints.getCountries.initiate(),
    );

    expect(result.data?.map(c => c.code)).toEqual(['AUT', 'BRA', 'JPN']);
    expect(spy).toHaveBeenCalledTimes(3);
    const offsets = spy.mock.calls.map(([req]) =>
      new URL((req as Request).url).searchParams.get('offset'),
    );
    expect(offsets).toEqual(['0', '100', '200']);
  });

  it('asks only for the card fields and sends the API key', async () => {
    const spy = mockFetch(json(200, page([country('JPN', 'Japan')], false)));
    await makeStore().dispatch(countriesApi.endpoints.getCountries.initiate());

    const request = requestOf(spy);
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe(
      'https://api.restcountries.com/countries/v5',
    );
    expect(url.searchParams.get('limit')).toBe('100');
    expect(url.searchParams.get('response_fields')).toBe(LIST_FIELDS);
    expect(request.headers.get('Authorization')).toBe('Bearer test-key');
  });

  it('stops paging if the server keeps saying "more"', async () => {
    const spy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => json(200, page([], true)));
    await makeStore().dispatch(countriesApi.endpoints.getCountries.initiate());
    expect(spy).toHaveBeenCalledTimes(5);
  });

  it('fails with a clear message when the key is missing', async () => {
    config.restCountriesApiKey = undefined;
    const spy = jest.spyOn(globalThis, 'fetch');

    const result = await makeStore().dispatch(
      countriesApi.endpoints.getCountries.initiate(),
    );

    expect(spy).not.toHaveBeenCalled();
    expect(getCountriesErrorMessage(result.error)).toBe(MISSING_KEY_MESSAGE);
  });

  it('explains an invalid key and a used-up monthly limit', async () => {
    mockFetch(json(401, { errors: [{ message: 'Unauthorized' }] }));
    const bad = await makeStore().dispatch(
      countriesApi.endpoints.getCountries.initiate(),
    );
    expect(getCountriesErrorMessage(bad.error)).toBe(
      'The REST Countries API key is missing or invalid.',
    );

    mockFetch(json(403, { errors: [{ message: 'Frozen' }] }));
    const frozen = await makeStore().dispatch(
      countriesApi.endpoints.getCountries.initiate(),
    );
    expect(getCountriesErrorMessage(frozen.error)).toBe(
      'The monthly REST Countries request limit has been reached.',
    );
  });
});

describe('getCountryByCode', () => {
  it('reads one country by its alpha-3 code', async () => {
    const spy = mockFetch(
      json(200, {
        data: {
          objects: [
            {
              ...country('JPN', 'Japan'),
              languages: [{ name: 'Japanese' }],
              capitals: [{ name: 'Tokyo', primary: true }],
            },
          ],
        },
      }),
    );

    const result = await makeStore().dispatch(
      countriesApi.endpoints.getCountryByCode.initiate('jpn'),
    );

    expect(result.data).toMatchObject({
      code: 'JPN',
      name: 'Japan',
      capital: 'Tokyo',
      languages: ['Japanese'],
    });
    const url = new URL(requestOf(spy).url);
    expect(url.pathname).toBe('/countries/v5/codes.alpha_3/JPN');
    expect(url.searchParams.get('response_fields_omit')).toContain(
      'names.translations',
    );
  });

  it('reports "not found" for an empty result', async () => {
    mockFetch(json(200, { data: { objects: [] } }));
    const result = await makeStore().dispatch(
      countriesApi.endpoints.getCountryByCode.initiate('XYZ'),
    );
    expect(result.error).toMatchObject({ status: 404 });
    expect(getCountriesErrorMessage(result.error)).toBe(
      'We could not find that country.',
    );
  });

  it('does not call the API for a malformed code', async () => {
    const spy = jest.spyOn(globalThis, 'fetch');
    const result = await makeStore().dispatch(
      countriesApi.endpoints.getCountryByCode.initiate('../auth'),
    );
    expect(spy).not.toHaveBeenCalled();
    expect(result.error).toMatchObject({ status: 404 });
  });
});
