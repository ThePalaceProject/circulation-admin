import { setupMswServer } from "../mswServer";

setupMswServer();

it("sends an unmatched request and catches the rejection", async () => {
  await fetch("https://example.test/caught").catch(() => undefined);
});
