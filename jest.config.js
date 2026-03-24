export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["functions/**/*.js", "!functions/**/**.test.js"],
  coverageDirectory: "coverage",
  verbose: true,
};
