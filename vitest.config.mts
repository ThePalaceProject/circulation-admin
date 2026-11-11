import { defineConfig } from "vitest/config";

const fileMock = "/tests/__mocks__/fileMock.js";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^.*\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|md)$/,
        replacement: fileMock,
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost/" },
    },
    setupFiles: [
      "tests/unit/vitest-polyfills.js",
      "tests/unit/vitest-setup.ts",
    ],
    include: ["tests/unit/**/*.test.{js,jsx,ts,tsx}"],
    css: false,
    // Run `afterEach` and `afterAll` hooks in the order they are defined.
    // Vitest's default is the reverse order.
    sequence: { hooks: "list" },
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/unit",
      reporter: ["lcov", "text-summary"],
      // Listing `src` here also reports source files that no test imports.
      // Without it they are left out, and the percentage rises while real
      // coverage is unchanged.
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
