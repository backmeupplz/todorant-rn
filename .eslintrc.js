module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  ignorePatterns: ['*.js'],
  extends: ['plugin:prettier/recommended'],
  rules: {
    // '@typescript-eslint/no-explicit-any': 'error',
    // '@typescript-eslint/explicit-module-boundary-types': 'warn',
    'react-native/no-inline-styles': 'off',
  },
}
