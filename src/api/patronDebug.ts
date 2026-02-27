/**
 * API functions for the patron debug authentication feature.
 */

export interface AuthMethodInfo {
  id: number;
  name: string;
  protocol: string;
  supportsDebug: boolean;
  supportsPassword: boolean;
  identifierLabel: string;
  passwordLabel: string;
}

export interface AuthMethodsResponse {
  authMethods: AuthMethodInfo[];
}

export type ResultDetailsArray = Array<ResultDetails>;
export interface ResultDetailsObject {
  [key: string]: ResultDetails;
}

export type ResultDetails =
  | string
  | number
  | boolean
  | null
  | ResultDetailsArray
  | ResultDetailsObject;

export interface PatronDebugResult {
  label: string;
  success: boolean;
  details: ResultDetails;
}

export interface PatronDebugResponse {
  results: PatronDebugResult[];
}

/**
 * Fetch the authentication methods configured for a library.
 */
export const fetchAuthMethods = async (
  library: string
): Promise<AuthMethodsResponse> => {
  const res = await fetch(`/${library}/admin/manage_patrons/auth_methods`);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}: GET ${res.url}`);
  }
  return res.json();
};

/**
 * Run patron debug authentication against a specific integration.
 */
export const runPatronDebug = async (
  library: string,
  integrationId: number,
  username: string,
  password: string | null,
  csrfToken: string
): Promise<PatronDebugResponse> => {
  const formData = new FormData();
  formData.append("integration_id", String(integrationId));
  formData.append("username", username);
  if (password !== null) {
    formData.append("password", password);
  }
  const res = await fetch(`/${library}/admin/manage_patrons/debug_auth`, {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    body: formData,
  });
  if (!res.ok) {
    throw new Error(
      `Request failed with status ${res.status}: POST ${res.url}`
    );
  }
  return res.json();
};
