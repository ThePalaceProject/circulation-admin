import { spawnSync } from "child_process";
import * as path from "path";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "./mswServer";

// `setupMswServer` fails a test from its own hooks, so a test cannot check
// that from the inside. This test runs the fixture files in a separate Jest
// process and checks which of them failed.
const rootDir = path.resolve(__dirname, "../../..");
// Use `<rootDir>`, not an absolute path. Jest escapes glob characters (such
// as parentheses) in the checkout path only when it expands `<rootDir>`.
const fixtureGlob =
  "<rootDir>/tests/jest/testUtils/mswServerFixtures/*.fixture.ts";

type FileResult = {
  name: string;
  status: string;
  message: string;
  assertionResults: { status: string; failureMessages: string[] }[];
};

let results: Record<string, FileResult>;

beforeAll(() => {
  const run = spawnSync(
    process.execPath,
    [
      require.resolve("jest/bin/jest"),
      "--config",
      path.join(rootDir, "jest.config.js"),
      "--testMatch",
      fixtureGlob,
      "--coverage=false",
      "--json",
    ],
    // `spawnSync` blocks, so Jest's hook timeout cannot stop a hung child.
    { cwd: rootDir, encoding: "utf8", timeout: 60000 }
  );
  if (run.error) {
    throw run.error;
  }
  let report: { testResults: FileResult[] };
  try {
    report = JSON.parse(run.stdout);
  } catch {
    throw new Error(
      `The fixture run printed no JSON report (status ${run.status}, signal ${run.signal}):\n${run.stderr}`
    );
  }
  results = {};
  report.testResults.forEach((file) => {
    // A file that fails to load (for example, a bad import) has no test
    // results. Show its error, not a confusing failure in a test below.
    if (file.assertionResults.length === 0) {
      throw new Error(`${file.name} did not run:\n${file.message}`);
    }
    results[path.basename(file.name, ".fixture.ts")] = file;
  });
});

describe("setupMswServer", () => {
  it("runs every fixture file", () => {
    expect(Object.keys(results).sort()).toEqual([
      "caught",
      "late",
      "matched",
      "nullInput",
    ]);
  });

  it("passes a test whose requests all match a handler", () => {
    expect(results.matched.status).toBe("passed");
  });

  it("fails a test that sends an unmatched request, even if the app catches the rejection", () => {
    const [test] = results.caught.assertionResults;
    expect(test.status).toBe("failed");
    expect(test.failureMessages.join("\n")).toContain(
      "Unhandled requests (from this test, or sent late by an earlier one): GET https://example.test/caught"
    );
  });

  it("fails a test that sends a null URL, as a browser would send GET /null", () => {
    const [test] = results.nullInput.assertionResults;
    expect(test.status).toBe("failed");
    expect(test.failureMessages.join("\n")).toContain(
      "GET http://localhost/null"
    );
  });

  it("fails the run when the last test sends an unmatched request late", () => {
    const [test] = results.late.assertionResults;
    // The test itself passed. The `afterAll` check fails the file instead.
    expect(test.status).toBe("passed");
    expect(results.late.status).toBe("failed");
    expect(results.late.message).toContain("GET https://example.test/late");
  });
});

// These checks expect their tests to pass, so they run in this process
// instead of as fixtures.
describe("setupMswServer fetch input", () => {
  const { requests } = setupMswServer(
    http.get("*/c", () => HttpResponse.text("ok")),
    http.post("*/c", () => HttpResponse.text("ok"))
  );

  it("sends a Request from clone() unchanged", async () => {
    // `clone()` returns Node's own `Request`, not the polyfill subclass. The
    // helper converts only a null input or a null init, so this Request must
    // arrive as sent.
    const response = await fetch(
      new Request("/c", { method: "POST", body: "x" }).clone()
    );
    expect(await response.text()).toBe("ok");
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(await requests[0].text()).toBe("x");
  });

  it("sends a request with a null init as one with no init", async () => {
    // A browser accepts a null init. MSW 2.7 would throw on it, even with a
    // matching handler, so the helper passes no init instead.
    const response = await fetch("/c", null as any);
    expect(await response.text()).toBe("ok");
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
  });
});
