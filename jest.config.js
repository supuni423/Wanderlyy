module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // These packages ship untranspiled ES modules, so Jest must run them through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native.*|@react-navigation|@reduxjs|react-redux|redux|redux-persist|immer)/)',
  ],
};
