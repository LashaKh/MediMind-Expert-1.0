module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Very lenient rules for rapid development - only block truly dangerous patterns
    '@typescript-eslint/no-explicit-any': 'off',  // Allow any types completely
    '@typescript-eslint/no-unused-vars': 'off', // Allow unused vars for now
    'no-console': ['warn', { 
      'allow': ['warn', 'error'] // Allow console.warn and console.error, warn about others
    }],
    'no-empty': 'off', // Allow empty blocks
    'no-misleading-character-class': 'off', // Allow regex issues
    'no-useless-escape': 'off', // Allow escape issues
    'no-case-declarations': 'off', // Allow switch case issues
    '@typescript-eslint/no-require-imports': 'off', // Allow require imports
    'no-useless-catch': 'off', // Allow try/catch issues
    // Disable some strict rules completely for faster development
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-types': 'off',
    'prefer-const': 'warn',
    'no-var': 'warn'
  },
  // Different rules for different directories
  overrides: [
    {
      // More lenient rules for functions directory (serverless functions)
      files: ['functions/**/*', 'supabase/functions/**/*'],
      rules: {
        'no-console': 'off', // Allow console in serverless functions for logging
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in serverless functions
        '@typescript-eslint/no-unused-vars': 'off', // Allow unused vars completely in functions
        'no-empty': 'off', // Allow empty blocks in functions
        'no-misleading-character-class': 'off',
        'no-useless-escape': 'off',
        'no-case-declarations': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-useless-catch': 'off'
      }
    },
    {
      // Strict rules for core src directory
      files: ['src/**/*'],
      rules: {
        'no-console': ['warn', { 'allow': ['warn', 'error'] }],
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      // Relaxed rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
      }
    }
  ]
};