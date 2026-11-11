import { http, HttpResponse } from "msw";
import { setupMswServer } from "../mswServer";

setupMswServer(http.get("https://example.test/ok", () => HttpResponse.text()));

it("sends a request that a handler matches", async () => {
  expect((await fetch("https://example.test/ok")).ok).toBe(true);
});
