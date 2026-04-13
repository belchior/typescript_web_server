import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginJest from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'

export default defineConfig([
  tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ignores: ['dist/**/*.{js,ts}'],
    plugins: { js, jest: pluginJest },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.node, ...pluginJest.environments.globals.globals },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
      'comma-dangle': ['error', { 'arrays': 'always-multiline', 'objects': 'always-multiline', 'imports': 'always-multiline', 'exports': 'always-multiline', 'functions': 'never' }],
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'linebreak-style': ['error', 'unix'],
      'max-len': ['error', { 'code': 100, 'tabWidth': 2, 'ignoreComments': true, 'ignoreTrailingComments': true, 'ignoreUrls': true, 'ignoreStrings': true, 'ignoreTemplateLiterals': true }],
      'no-console': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'no-unused-vars': 'off',
      'object-curly-spacing': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      'quotes': ['error', 'single'],
      'semi': [2, 'never'],
      'space-before-function-paren': ['error', { 'anonymous': 'always', 'asyncArrow': 'always', 'named': 'never' }],
      'space-in-parens': ['error', 'never'],
    },
  },
])
