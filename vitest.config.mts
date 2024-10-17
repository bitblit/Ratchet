import { defineConfig } from 'vitest/config';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

// TODO: This does not work yet...
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());


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
