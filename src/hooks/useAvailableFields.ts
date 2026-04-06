import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PatronBlockingRule } from "../interfaces";
import { validatePatronBlockingRuleExpression } from "../api/patronBlockingRules";

// There is no dedicated endpoint for fetching available patron fields, so we
// use the validate endpoint with a trivially-passing rule ("True") to obtain
// the available_fields dictionary without validating any real user input.
const PREFETCH_RULE: PatronBlockingRule = { name: "__prefetch__", rule: "True" };

export interface UseAvailableFieldsResult {
  availableFields: Record<string, unknown> | null;
  fieldsLoading: boolean;
  fieldsError: string | null;
  /** Call with the latest fields dict whenever a blur-validation returns new data. */
  updateFields: (fields: Record<string, unknown>) => void;
}

/**
 * Eagerly pre-fetches the available patron template fields by calling the
 * validation endpoint on mount (and whenever {@link serviceId} changes).
 * Results are cached by React Query for 5 minutes.
 *
 * @param serviceId - The ID of the saved patron auth service.  When undefined
 *   the query is disabled and {@link fieldsError} reports that the service must
 *   be saved first.
 * @param csrfToken - CSRF token forwarded to the validation endpoint.
 */
export function useAvailableFields(
  serviceId: number | undefined,
  csrfToken: string | undefined
): UseAvailableFieldsResult {
  const queryClient = useQueryClient();
  const queryKey = ["patron-blocking-fields", serviceId] as const;

  const { data, isInitialLoading: isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await validatePatronBlockingRuleExpression(
        serviceId!,
        PREFETCH_RULE,
        csrfToken
      );
      if (result.error) {
        throw new Error(result.error);
      }
      if (!result.availableFields) {
        throw new Error(
          "Available fields could not be retrieved. Check that test credentials are configured."
        );
      }
      return result.availableFields;
    },
    enabled: serviceId !== undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const updateFields = useCallback(
    (fields: Record<string, unknown>) => {
      queryClient.setQueryData(queryKey, fields);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, serviceId]
  );

  const fieldsError =
    serviceId === undefined
      ? "Save the service before template variables can be fetched."
      : error instanceof Error
      ? error.message
      : null;

  return {
    availableFields: data ?? null,
    fieldsLoading: isLoading,
    fieldsError,
    updateFields,
  };
}
