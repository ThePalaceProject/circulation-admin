import { PatronBlockingRule } from "../interfaces";

const VALIDATE_URL = "/admin/patron_auth_service_validate_patron_blocking_rule";

export type ValidationResult = {
  /** Non-null when the server reports a validation error; null on success. */
  error: string | null;
  /** The patron data dictionary returned by the SIP call on success; null on error or parse failure. */
  availableFields: Record<string, unknown> | null;
};

/**
 * Validate a patron blocking rule expression against live ILS data on the server.
 *
 * The server loads the saved PatronAuthService by serviceId, makes a live
 * authentication call using its configured test credentials, and evaluates
 * the rule expression against the real patron data returned.
 *
 * On success, returns the available_fields dictionary (patron data from the SIP
 * call) so callers can display template variable names and sample values to the
 * user.  On failure, returns the error message string.
 */
export const validatePatronBlockingRuleExpression = async (
  serviceId: number | undefined,
  rule: PatronBlockingRule,
  csrfToken: string | undefined
): Promise<ValidationResult> => {
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
    try {
      const data = await res.json();
      const fields = data.available_fields;
      return {
        error: null,
        availableFields:
          fields && typeof fields === "object" && !Array.isArray(fields)
            ? (fields as Record<string, unknown>)
            : null,
      };
    } catch {
      return { error: null, availableFields: null };
    }
  }

  try {
    const data = await res.json();
    return {
      error: data.detail || "Rule validation failed.",
      availableFields: null,
    };
  } catch {
    return { error: "Rule validation failed.", availableFields: null };
  }
};
