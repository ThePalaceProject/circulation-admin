import { setupMswServer } from "../mswServer";

setupMswServer();

// Runs after the helper's `afterEach`, and waits long enough for the late
// request below to start.
afterEach(() => new Promise((resolve) => setTimeout(resolve, 50)));

it("sends an unmatched request after its own afterEach", () => {
  setTimeout(() => {
    fetch("https://example.test/late").catch(() => undefined);
  }, 5);
});
