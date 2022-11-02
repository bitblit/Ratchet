module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'artifacts/coverage',
  /*
  This is recommended to catch files you arent testing at all, but will
  need tweaks since I don't want to test index files, etc.  A job
  for a different day
  collectCoverageFrom: ['./src/**'],
   */
  coverageThreshold: {
    global: {
      lines: 10,
    },
  },
};
