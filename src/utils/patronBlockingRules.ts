export const SIP2_PROTOCOL = "api.sip";

export function supportsPatronBlockingRules(protocolName: string): boolean {
  return protocolName === SIP2_PROTOCOL;
}
