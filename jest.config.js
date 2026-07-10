/** @type {import('ts-jest').JestConfigWithTsJest} */

// Options shared by both projects.
const sharedProjectConfig = {
  preset: "ts-jest",
  testEnvironmentOptions: {
    // Without this, jsdom's default `["browser"]` export condition resolves sinon
    // to its ESM bundle, which ts-jest does not transform. Every legacy suite then
    // dies with `SyntaxError: Unexpected token 'export'`.
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/jest.polyfills.js"],
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
  roots: ["<rootDir>/src"],
};

module.exports = {
  coverageDirectory: "coverage/jest",
  coverageReporters: ["lcov", "text-summary"],
  // Must live at the top level, not inside `projects`: jest reads
  // `collectCoverageFrom` off the *global* config. Set it only per-project and it
  // is silently undefined globally, so every executed file gets instrumented —
  // including test helpers and everything under `tests/`.
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
  ],
  projects: [
    {
      ...sharedProjectConfig,
      displayName: "unit",
      roots: [...sharedProjectConfig.roots, "<rootDir>/tests/jest"],
      testMatch: ["<rootDir>/tests/jest/**/*.test.{js,jsx,ts,tsx}"],
      // `jest-fixed-jsdom` restores Node's fetch/Response globals so MSW can
      // intercept them.
      testEnvironment: "jest-fixed-jsdom",
      setupFilesAfterEnv: ["<rootDir>/tests/jest/jest-setup.ts"],
    },
    {
      // Legacy enzyme + chai + sinon tests, still in `src/**/__tests__/`. They are
      // being rewritten as React Testing Library tests under `tests/jest/`; when the
      // last one is gone, delete this project, its environment, and its setup file.
      //
      // These cannot use `jest-fixed-jsdom`: it swaps in undici's `FormData`, which
      // rejects `new FormData(formElement)` and crashes any test that submits a form.
      ...sharedProjectConfig,
      displayName: "legacy",
      testMatch: ["<rootDir>/src/**/__tests__/*-test.{ts,tsx}"],
      testEnvironment: "<rootDir>/tests/jest/legacyJsdomEnvironment.js",
      setupFilesAfterEnv: ["<rootDir>/tests/jest/legacy-setup.ts"],
    },
  ],
};
