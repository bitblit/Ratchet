import { defineConfig } from 'vitest/config';

// Use the working directory as the root so module scripts only run their own
// tests and write coverage inside their own artifacts directory.
export default defineConfig({
  test: {
    passWithNoTests: true,
    pool: 'forks',
    coverage: {
      reportsDirectory: 'artifacts/coverage',
      provider: 'v8',
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
