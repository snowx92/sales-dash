module.exports = {
  // ... other config
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  }
} 