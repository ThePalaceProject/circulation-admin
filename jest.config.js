/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/tests/__mocks__/styleMock.js",
    "\\.md$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["./jest.polyfills.js"],
  setupFilesAfterEnv: ["./tests/jest/jest-setup.ts"],
  // `src` must stay in `roots` so that `collectCoverageFrom` can discover source
  // files that no jest test imports — otherwise they are silently omitted from
  // the report rather than counted as uncovered. `testMatch` (not `--roots`) is
  // therefore what keeps jest from picking up the legacy mocha tests that live
  // in `src/**/__tests__/`.
  roots: ["<rootDir>/src", "<rootDir>/tests/jest"],
  testMatch: ["<rootDir>/tests/jest/**/*.test.{js,jsx,ts,tsx}"],
  coverageDirectory: "coverage/jest",
  coverageReporters: ["lcov", "text-summary"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/testHelper.ts",
    "!src/**/*.d.ts",
  ],
};
