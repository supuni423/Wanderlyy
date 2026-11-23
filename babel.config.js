module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Zod 4 uses `export * as x from` syntax, which the RN preset does not compile.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        // `@/features/auth` instead of `../../../features/auth`
        alias: { '@': './src' },
      },
    ],
  ],
};
