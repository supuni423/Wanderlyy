module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
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
