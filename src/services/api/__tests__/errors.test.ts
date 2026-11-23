import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '../errors';

describe('getApiErrorMessage', () => {
  it('returns nothing when there is no error', () => {
    expect(getApiErrorMessage(undefined)).toBeUndefined();
  });

  it('explains network problems', () => {
    expect(
      getApiErrorMessage({ status: 'FETCH_ERROR', error: 'Network failed' }),
    ).toBe(NETWORK_ERROR_MESSAGE);
    expect(getApiErrorMessage({ status: 'TIMEOUT_ERROR', error: '' })).toBe(
      NETWORK_ERROR_MESSAGE,
    );
  });

  it('uses the screen-specific message for bad requests', () => {
    const error = { status: 400, data: { message: 'Invalid credentials' } };
    expect(
      getApiErrorMessage(error, { badRequest: 'Wrong username or password.' }),
    ).toBe('Wrong username or password.');
  });

  it("falls back to the server's message for bad requests", () => {
    const error = { status: 400, data: { message: 'Username taken' } };
    expect(getApiErrorMessage(error)).toBe('Username taken');
  });

  it('uses the fallback for server errors', () => {
    expect(
      getApiErrorMessage({ status: 500, data: null }, { fallback: 'Oops' }),
    ).toBe('Oops');
  });
});
