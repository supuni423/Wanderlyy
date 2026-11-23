import { act, renderHook } from '@testing-library/react-native';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only updates after the value stops changing', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '' } },
    );

    await rerender({ value: 'j' });
    await act(async () => jest.advanceTimersByTime(100));
    await rerender({ value: 'ja' });
    await act(async () => jest.advanceTimersByTime(100));
    await rerender({ value: 'jap' });

    // Typing is still going on: the old value is kept.
    expect(result.current).toBe('');

    await act(async () => jest.advanceTimersByTime(250));
    expect(result.current).toBe('jap');
  });
});
