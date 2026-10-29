import { setupMswServer } from "../mswServer";

setupMswServer();

it("sends a request with a null URL and catches the rejection", async () => {
  await fetch(null as any).catch(() => undefined);
});
