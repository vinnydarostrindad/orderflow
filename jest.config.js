export default {
  transform: {},
  coverageDirectory: "coverage",
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/src/**/*.js",
    "!**/src/**/tests/**",
    "!**/src/**/migrations/**",
  ],
};
