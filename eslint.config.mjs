// import { FlatCompat } from '@eslint/eslintrc';

// const compat = new FlatCompat({
//   baseDirectory: import.meta.url,
// });

// export default [
//   ...compat.config({
//     parser: '@typescript-eslint/parser',
//     plugins: ['@typescript-eslint', 'prettier'],
//     extends: [
//       'plugin:@typescript-eslint/recommended',
//       'plugin:prettier/recommended',
//     ],
//     rules: {
//       '@typescript-eslint/no-require-imports': 'off',
//     },
//   }),
// ];


export default {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:prettier/recommended',
    'prettier',
    'eslint:recommended'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'no-var': 'error',
    semi: 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-multi-spaces': 'error',
    'space-in-parens': 'error',
    'no-multiple-empty-lines': 'error',
    'prefer-const': 'error',
  },
};
