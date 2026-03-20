/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    // Force all code (including npm-linked packages) to use the single React
    // copy in circulation-admin's node_modules, preventing duplicate-context bugs.
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
    "^react-dom/(.*)": "<rootDir>/node_modules/react-dom/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/tests/__mocks__/styleMock.js",
  },
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
  testEnvironment: "jest-fixed-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["./jest.polyfills.js"],
  setupFilesAfterEnv: ["./tests/jest/jest-setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/components/__tests__/",
  ],
};
