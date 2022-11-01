module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'artifacts/coverage',
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: {
    global: {
      lines: 10,
    },
  },
};
