import { RequestHandler } from "msw";
import { setupServer, SetupServerApi } from "msw/node";

export interface MswServer {
  server: SetupServerApi;
  // Every request the server received in the current test, in order. Each
  // entry is a copy, so a test can read its body after the handler has.
  requests: Request[];
}

// Starts an MSW server for a test file and records the requests it receives.
// Call it once per test file, either at the top level or in each of several
// sibling `describe` blocks. Do not nest the calls: two servers at once each
// treat the other's handlers as unhandled.
//
// `handlers` stay in place for the whole file. Handlers that a test adds with
// `server.use()` are removed after that test, and `requests` is cleared.
//
// A request that no handler matches never goes to the network while the
// server runs, and it fails the test after the test ends. MSW alone only
// rejects that `fetch`, and app code that catches the rejection would hide the
// missing handler.
export function setupMswServer(...handlers: RequestHandler[]): MswServer {
  const server = setupServer(...handlers);
  const requests: Request[] = [];
  const unhandled: string[] = [];
  server.events.on("request:start", ({ request }) => {
    requests.push(request.clone());
  });
  let mswFetch: typeof fetch;
  beforeAll(() => {
    server.listen({
      onUnhandledRequest(request, print) {
        unhandled.push(`${request.method} ${request.url}`);
        print.error();
      },
    });
    // A browser resolves `fetch(null)` against the page URL, like the relative
    // path "null" (in tests, `GET http://localhost/null`), and it treats a null
    // init as no init. MSW 2.7 throws a TypeError on either null before it
    // looks for a handler (it reads `.headers` on each), so the check above
    // would never see the request. Convert both, as a browser does. The
    // `Request` polyfill in jest.polyfills.js converts any other input that is
    // not a `Request`.
    mswFetch = globalThis.fetch;
    globalThis.fetch = (input, init) =>
      mswFetch(
        input === null ? "null" : input,
        init === null ? undefined : init
      );
  });
  const failOnUnhandled = () => {
    const missed = unhandled.splice(0);
    if (missed.length) {
      // Jest reports this against the current test, so say that the request
      // may have come from an earlier one.
      throw new Error(
        `Unhandled requests (from this test, or sent late by an earlier one): ${missed.join(", ")}`
      );
    }
  };
  afterEach(() => {
    server.resetHandlers();
    requests.length = 0;
    failOnUnhandled();
  });
  afterAll(() => {
    globalThis.fetch = mswFetch;
    server.close();
    failOnUnhandled();
  });
  return { server, requests };
}
