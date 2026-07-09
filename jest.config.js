/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  // `jest-fixed-jsdom` restores Node's fetch/Response globals so MSW can
  // intercept them.
  testEnvironment: "jest-fixed-jsdom",
  testEnvironmentOptions: {
    // MSW / jest-fixed-jsdom rely on the default resolution conditions; the empty
    // string keeps jsdom's "browser" condition from pulling in ESM-only builds
    // that ts-jest would not transform.
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest/jest-setup.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/__mocks__/styleMock.js",
    "\\.md$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  // `src` must stay in `roots` so that `collectCoverageFrom` can discover source
  // files that no test imports — otherwise they are silently omitted from the
  // report rather than counted as uncovered, and the coverage percentage rises
  // while real coverage is unchanged.
  roots: ["<rootDir>/src", "<rootDir>/tests/jest"],
  testMatch: ["<rootDir>/tests/jest/**/*.test.{js,jsx,ts,tsx}"],
  coverageDirectory: "coverage/jest",
  coverageReporters: ["lcov", "text-summary"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
  ],
};
