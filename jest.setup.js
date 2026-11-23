/* eslint-env jest */
// Native modules do not exist in the Node test environment, so replace them with mocks.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// In-memory Keychain, so tests can save a session and read it back.
jest.mock('react-native-keychain', () => {
  const entries = new Map();
  const key = options => (options && options.service) || 'default';
  return {
    ACCESSIBLE: {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    },
    setGenericPassword: jest.fn((username, password, options) => {
      entries.set(key(options), { username, password });
      return Promise.resolve({ service: key(options), storage: 'mock' });
    }),
    getGenericPassword: jest.fn(options => {
      const entry = entries.get(key(options));
      return Promise.resolve(
        entry ? { ...entry, service: key(options), storage: 'mock' } : false,
      );
    }),
    resetGenericPassword: jest.fn(options =>
      Promise.resolve(entries.delete(key(options))),
    ),
  };
});

// SafeAreaProvider waits for native insets before rendering children; the mock supplies them.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
