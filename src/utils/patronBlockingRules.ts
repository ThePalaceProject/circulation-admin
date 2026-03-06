export const SIP2_PROTOCOL = "api.sip";

export function supportsPatronBlockingRules(
  protocolName: string | null | undefined
): boolean {
  return protocolName === SIP2_PROTOCOL;
}
