import { defineConfig } from "vitest/config";
import baseConfig from "../../../../vitest.config.mjs";

// Only `mswServer.test.ts` uses this config. It runs the fixture files. Some
// of them fail on purpose, so the main run must not include them.
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["tests/jest/testUtils/mswServerFixtures/*.fixture.ts"],
  },
});
