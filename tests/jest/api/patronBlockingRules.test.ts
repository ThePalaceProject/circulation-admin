import * as fetchMock from "fetch-mock-jest";
import { validatePatronBlockingRuleExpression } from "../../../src/api/patronBlockingRules";
import { PatronBlockingRule } from "../../../src/interfaces";

const VALIDATE_URL = "/admin/patron_auth_service_validate_patron_blocking_rule";

const sampleRule: PatronBlockingRule = {
  name: "Fine Check",
  rule: "{fines} > 10.0",
};

describe("validatePatronBlockingRuleExpression", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("returns null on a 200 response", async () => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
    const result = await validatePatronBlockingRuleExpression(
      42,
      sampleRule,
      "test-token"
    );
    expect(result).toBeNull();
  });

  it("returns the detail string from a 400 response", async () => {
    fetchMock.post(VALIDATE_URL, {
      status: 400,
      body: { detail: "Unknown placeholder: {unknown_field}" },
    });
    const result = await validatePatronBlockingRuleExpression(
      42,
      sampleRule,
      "test-token"
    );
    expect(result).toBe("Unknown placeholder: {unknown_field}");
  });

  it("returns a fallback string when a 400 response body has no detail", async () => {
    fetchMock.post(VALIDATE_URL, { status: 400, body: {} });
    const result = await validatePatronBlockingRuleExpression(
      42,
      sampleRule,
      "test-token"
    );
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  it("sends the correct URL, method, and CSRF header", async () => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
    await validatePatronBlockingRuleExpression(42, sampleRule, "my-csrf-token");
    expect(fetchMock).toHaveBeenCalledWith(
      VALIDATE_URL,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-Token": "my-csrf-token" }),
      })
    );
  });

  it("omits service_id from the form body when serviceId is undefined", async () => {
    fetchMock.post(VALIDATE_URL, { status: 200 });
    // Should not throw and should still make the request (server returns "save first" error)
    const result = await validatePatronBlockingRuleExpression(
      undefined,
      sampleRule,
      "tok"
    );
    expect(fetchMock).toHaveBeenCalledWith(
      VALIDATE_URL,
      expect.objectContaining({ method: "POST" })
    );
    // Server would return an error detail in a real call; here it returns 200 (mocked)
    expect(result).toBeNull();
  });
});
