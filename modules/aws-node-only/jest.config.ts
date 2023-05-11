// Ripped from https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],
  passWithNoTests: true,
  //preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'artifacts/coverage',
  roots: ['src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
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
    '^.+\\.[tj]s?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export default config;
