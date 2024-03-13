import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // [...]
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  passWithNoTests: true,
  collectCoverage: true,
  coverageDirectory: 'artifacts/coverage',
  maxConcurrency: 10,
  /*
    This is recommended to catch files you are not testing at all, but will
    need tweaks since I don't want to test index files, etc.  A job
    for a different day
    collectCoverageFrom: ['./src/**'],
     */
  coverageThreshold: {
    global: {
      lines: 10,
    },
  },
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export default jestConfig;
