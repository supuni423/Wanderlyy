module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.afterEnv.js'],
  // The first (cold) run compiles everything and can be slow on some laptops.
  testTimeout: 15000,
  // `npm run test:coverage`: measure app code only (not barrels/types/assets)
  // and fail if coverage drops clearly below today's level.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/types.ts',
    '!src/types/**',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: { statements: 95, branches: 85, functions: 90, lines: 95 },
  },
  // These packages ship untranspiled ES modules, so Jest must run them through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native.*|@react-navigation|@reduxjs|react-redux|redux|redux-persist|immer)/)',
  ],
};
