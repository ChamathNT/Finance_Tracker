module.exports = {
    testEnvironment: "node",
    moduleFileExtensions: ["js", "json"],
    testMatch: ["**/tests/unit/**/*.test.js"], // Only run tests inside `tests/services/`
    collectCoverageFrom: ["services/**/*.js"], // Collect coverage only for service classes
    coverageDirectory: "coverage",
    restoreMocks: true,
  };