export default {
  transform: {},
  coverageDirectory: "coverage",
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/src/**/*.js",
    "!**/src/**/tests/**",
    "!**/src/**/migrations/**",
    "!**/src/**/wait-for-postgres.js",
    "!**/src/**/main/**",
  ],
};
