import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    coverage: {
      reportsDirectory: 'artifacts/coverage',
      provider: 'istanbul', // or 'v8'
    },
  },
});
