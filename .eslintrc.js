module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'sort-imports-es6-autofix',
    'import',
    'no-relative-import-paths',
    'eslint-plugin-node',
  ],
  ignorePatterns: ['*.js'],
  extends: [
    'plugin:prettier/recommended',
    // 'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    // '@react-native-community',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-relative-import-paths/no-relative-import-paths': 'error',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        tabWidth: 2,
        semi: false,
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
}
