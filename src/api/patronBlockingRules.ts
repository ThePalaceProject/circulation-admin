import { PatronBlockingRule } from "../interfaces";

const VALIDATE_URL = "/admin/patron_auth_service_validate_patron_blocking_rule";

/**
 * Validate a patron blocking rule expression against live ILS data on the server.
 *
 * The server loads the saved PatronAuthService by serviceId, makes a live
 * authentication call using its configured test credentials, and evaluates
 * the rule expression against the real patron data returned.  Only parse/eval
 * success or failure is reported — the boolean result is discarded.
 *
 * Returns null on success, or an error message string on failure.
 */
export const validatePatronBlockingRuleExpression = async (
  serviceId: number | undefined,
  rule: PatronBlockingRule,
  csrfToken: string | undefined
): Promise<string | null> => {
  const formData = new FormData();
  if (serviceId !== undefined) {
    formData.append("service_id", String(serviceId));
  }
  formData.append("rule", rule.rule);
  formData.append("name", rule.name);

  const headers: Record<string, string> = {};
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(VALIDATE_URL, {
    method: "POST",
    headers,
    body: formData,
    credentials: "same-origin",
  });

  if (res.ok) {
    return null;
  }

  try {
    const data = await res.json();
    return data.detail || "Rule validation failed.";
  } catch {
    return "Rule validation failed.";
  }
};
