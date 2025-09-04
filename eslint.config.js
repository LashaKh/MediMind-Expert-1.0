import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Very lenient rules for development speed
      'no-console': ['warn', {
        'allow': ['warn', 'error'] // Allow console.warn and console.error
      }],
      // Turn off strict TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': 'off',
      'no-misleading-character-class': 'off',
      'no-useless-escape': 'off',
      'no-case-declarations': 'off',
      'no-useless-catch': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn'
    },
  },
  // Allow console.log in serverless functions and scripts
  {
    files: ['functions/**/*', 'supabase/functions/**/*', 'scripts/**/*', 'supabase-functions/**/*'],
    rules: {
      'no-console': 'off', // Allow all console methods in serverless functions
      'no-control-regex': 'off', // Allow control characters in regex for data sanitization
      'no-prototype-builtins': 'off', // Allow hasOwnProperty in utility functions
    },
  },
  // Relaxed rules for test files
  {
    files: ['**/*.test.*', '**/*.spec.*', 'src/__tests__/**/*', 'test/**/*', 'tests/**/*'],
    rules: {
      'no-console': 'off', // Allow console in test files
      'react-refresh/only-export-components': 'off', // Don't enforce component-only exports in tests
      '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore in tests
    },
  }
);
