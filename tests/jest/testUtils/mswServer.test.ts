import { spawnSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "./mswServer";

// `setupMswServer` fails a test from its own hooks, so a test cannot check
// that from the inside. This test runs the fixture files in a separate Vitest
// process and checks which of them failed.
const rootDir = path.resolve(__dirname, "../../..");
// `spawnSync` blocks, so a timer cannot stop a hung child. `fixtureRunTimeout`
// stops it, and the hook timeout must be longer so the hook can report that.
const fixtureRunTimeout = 60000;
const hookTimeout = fixtureRunTimeout + 10000;

type FileResult = {
  name: string;
  status: string;
  message: string;
  assertionResults: { status: string; failureMessages: string[] }[];
};

let results: Record<string, FileResult>;

beforeAll(() => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "msw-fixtures-"));
  const outputFile = path.join(outputDir, "report.json");
  let report: { testResults: FileResult[] };
  try {
    const run = spawnSync(
      process.execPath,
      [
        path.join(rootDir, "node_modules/vitest/vitest.mjs"),
        "run",
        "--config",
        path.join(__dirname, "mswServerFixtures/vitest.config.mts"),
        "--coverage.enabled=false",
        "--no-file-parallelism",
        "--reporter=json",
        `--outputFile=${outputFile}`,
      ],
      { cwd: rootDir, encoding: "utf8", timeout: fixtureRunTimeout }
    );
    if (run.error) {
      throw run.error;
    }
    try {
      report = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    } catch {
      throw new Error(
        `The fixture run wrote no JSON report (status ${run.status}, signal ${run.signal}):\n${run.stderr}`
      );
    }
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
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
}, hookTimeout);

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
