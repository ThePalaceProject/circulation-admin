import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AuthMethodInfo,
  PatronDebugResult,
  fetchAuthMethods,
  runPatronDebug,
} from "../api/patronDebug";
import DebugResultListItem from "./DebugResultListItem";

export interface DebugAuthenticationProps {
  library: string;
  csrfToken: string;
  active?: boolean;
}

/** Admin tool for running diagnostic authentication checks against patron auth providers. */
const DebugAuthentication: React.FC<DebugAuthenticationProps> = ({
  library,
  csrfToken,
  active = true,
}) => {
  const [selectedMethodId, setSelectedMethodId] = React.useState<string>("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [results, setResults] = React.useState<PatronDebugResult[] | null>(
    null
  );

  // Fetch auth methods for this library
  const {
    data: authMethodsData,
    isLoading: isLoadingMethods,
    isError: isMethodsError,
    error: methodsError,
  } = useQuery({
    queryKey: ["patron_debug_auth_methods", library],
    queryFn: () => fetchAuthMethods(library),
    enabled: active && !!library,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const authMethods = React.useMemo(() => authMethodsData?.authMethods ?? [], [
    authMethodsData,
  ]);

  // Keep selected method in sync with current library's methods.
  React.useEffect(() => {
    if (authMethods.length === 0) {
      if (selectedMethodId !== "") {
        setSelectedMethodId("");
        setUsername("");
        setPassword("");
        setResults(null);
      }
      return;
    }

    const selectedMethodStillExists = authMethods.some(
      (method) => String(method.id) === selectedMethodId
    );

    if (selectedMethodStillExists) {
      return;
    }

    if (authMethods.length === 1) {
      setSelectedMethodId(String(authMethods[0].id));
    } else if (selectedMethodId !== "") {
      setSelectedMethodId("");
    }

    setUsername("");
    setPassword("");
    setResults(null);
  }, [authMethods, selectedMethodId]);

  const selectedMethod = authMethods.find(
    (m) => String(m.id) === selectedMethodId
  );

  // Mutation for running debug auth
  const debugMutation = useMutation({
    mutationFn: () =>
      runPatronDebug(
        library,
        Number(selectedMethodId),
        username,
        selectedMethod?.supportsPassword ? password : null,
        csrfToken
      ),
    onSuccess: (data) => {
      setResults(data.results);
    },
    onError: (error: Error) => {
      setResults([
        {
          label: "Request Error",
          success: false,
          details: error.message,
        },
      ]);
    },
  });

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMethodId(e.target.value);
    setUsername("");
    setPassword("");
    setResults(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(null);
    debugMutation.mutate();
  };

  return (
    <div className="debug-authentication">
      <h3>Debug Authentication</h3>
      <p>
        Run diagnostic authentication checks to troubleshoot patron login
        issues. Select an authentication method and enter patron credentials to
        see step-by-step results.
      </p>

      {isLoadingMethods && <p>Loading authentication methods...</p>}
      {isMethodsError && (
        <p className="text-danger">
          Error loading authentication methods:{" "}
          {(methodsError as Error)?.message}
        </p>
      )}

      {!isLoadingMethods && !isMethodsError && authMethods.length === 0 && (
        <div className="alert alert-warning">
          This library has no patron authentication integrations configured.
        </div>
      )}

      {!isLoadingMethods && !isMethodsError && authMethods.length > 0 && (
        <form className="edit-form" onSubmit={handleSubmit}>
          {authMethods.length > 1 && (
            <div className="form-group">
              <label htmlFor="debug-auth-method">Authentication Method</label>
              <select
                id="debug-auth-method"
                className="form-control"
                value={selectedMethodId}
                onChange={handleMethodChange}
              >
                <option value="">-- Select a method --</option>
                {authMethods.map((method) => (
                  <option key={method.id} value={String(method.id)}>
                    {method.name} ({method.protocol})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedMethod && !selectedMethod.supportsDebug && (
            <div className="alert alert-info">
              Debug authentication is not supported for this authentication
              method.
            </div>
          )}

          {selectedMethod && selectedMethod.supportsDebug && (
            <>
              <div className="form-group">
                <label htmlFor="debug-auth-username">
                  {selectedMethod.identifierLabel}
                </label>
                <input
                  id="debug-auth-username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {selectedMethod.supportsPassword && (
                <div className="form-group">
                  <label htmlFor="debug-auth-password">
                    {selectedMethod.passwordLabel}
                  </label>
                  <input
                    id="debug-auth-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-default"
                disabled={!username || debugMutation.isLoading}
              >
                {debugMutation.isLoading ? "Running..." : "Run Debug"}
              </button>
            </>
          )}
        </form>
      )}

      {results && (
        <div className="debug-results">
          <h4>Results</h4>
          <ul className="debug-results-list">
            {results.map((result, idx) => (
              <DebugResultListItem key={idx} sequence={idx} result={result} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DebugAuthentication;
