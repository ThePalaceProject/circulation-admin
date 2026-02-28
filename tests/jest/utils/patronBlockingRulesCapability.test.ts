import {
  SIP2_PROTOCOL,
  supportsPatronBlockingRules,
} from "../../../src/utils/patronBlockingRules";

describe("supportsPatronBlockingRules", () => {
  it("returns true for SIP2 protocol", () => {
    expect(supportsPatronBlockingRules(SIP2_PROTOCOL)).toBe(true);
    expect(supportsPatronBlockingRules("api.sip")).toBe(true);
  });

  it("returns false for other protocol types", () => {
    expect(supportsPatronBlockingRules("api.sirsidynix.auth")).toBe(false);
    expect(supportsPatronBlockingRules("api.saml.provider")).toBe(false);
    expect(supportsPatronBlockingRules("api.millenium.patron")).toBe(false);
    expect(supportsPatronBlockingRules("")).toBe(false);
  });

  it("returns false for null-ish values", () => {
    expect(supportsPatronBlockingRules(null)).toBe(false);
    expect(supportsPatronBlockingRules(undefined)).toBe(false);
  });
});
