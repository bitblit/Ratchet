import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    passWithNoTests: true,
    coverage: {
      reportsDirectory: 'artifacts/coverage',
      provider: 'istanbul', // or 'v8'
    },
  },
});
