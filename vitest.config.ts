import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    passWithNoTests: true,
    //setupFiles: ['../../vitest.setup.ts'],
    coverage: {
      reportsDirectory: 'artifacts/coverage',
      provider: 'istanbul', // or 'v8'
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
