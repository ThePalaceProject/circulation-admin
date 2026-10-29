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
  beforeAll(() =>
    server.listen({
      onUnhandledRequest(request, print) {
        unhandled.push(`${request.method} ${request.url}`);
        print.error();
      },
    })
  );
  const failOnUnhandled = () => {
    const missed = unhandled.splice(0);
    if (missed.length) {
      // A request that an earlier test sent late (after its own `afterEach`)
      // also lands here, so check the test before this one too.
      throw new Error(`Unhandled requests: ${missed.join(", ")}`);
    }
  };
  afterEach(() => {
    server.resetHandlers();
    requests.length = 0;
    failOnUnhandled();
  });
  afterAll(() => {
    server.close();
    failOnUnhandled();
  });
  return { server, requests };
}
