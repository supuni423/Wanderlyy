module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.afterEnv.js'],
  // The first (cold) run compiles everything and can be slow on some laptops.
  testTimeout: 15000,
  // These packages ship untranspiled ES modules, so Jest must run them through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native.*|@react-navigation|@reduxjs|react-redux|redux|redux-persist|immer)/)',
  ],
};
