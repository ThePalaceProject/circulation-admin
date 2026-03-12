import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api/apiSlice";
import { ServiceData, DiagnosticsData } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export function rtkErrorToFetchError(error: unknown): FetchErrorData | null {
  if (!error) return null;
  const e = error as any;
  return {
    status: e.status ?? 0,
    response: e.data?.detail ?? e.error ?? String(error),
    url: "",
  };
}

export function isResultFetching(result: {
  isLoading?: boolean;
  isFetching?: boolean;
}): boolean {
  return !!(result?.isLoading || result?.isFetching);
}

// ---------------------------------------------------------------------------
// Self Tests
// ---------------------------------------------------------------------------

/** The server returns { self_test_results: ServiceData } for a self-test URL. */
export interface SelfTestResultsResponse {
  self_test_results: ServiceData;
}

export const selfTestsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSelfTestResults: build.query<SelfTestResultsResponse, string>({
      query: (url) => url,
      providesTags: (_result, _error, url) => [{ type: "SelfTests", id: url }],
    }),

    runSelfTests: build.mutation<void, string>({
      query: (url) => ({
        url,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: (_result, _error, url) => [
        { type: "SelfTests", id: url },
      ],
    }),
  }),
});

// ---------------------------------------------------------------------------
// selfTestsUiSlice — tracks runSelfTests mutation isMutating flag
// ---------------------------------------------------------------------------

export interface SelfTestsUiState {
  isMutating: boolean;
}

export const selfTestsUiSlice = createSlice({
  name: "selfTestsUi",
  initialState: { isMutating: false } as SelfTestsUiState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(selfTestsApi.endpoints.runSelfTests.matchPending, (state) => {
        state.isMutating = true;
      })
      .addMatcher(
        selfTestsApi.endpoints.runSelfTests.matchFulfilled,
        (state) => {
          state.isMutating = false;
        }
      )
      .addMatcher(
        selfTestsApi.endpoints.runSelfTests.matchRejected,
        (state) => {
          state.isMutating = false;
        }
      );
  },
});

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export const diagnosticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDiagnostics: build.query<DiagnosticsData, void>({
      query: () => "/admin/diagnostics",
    }),
  }),
});

export const {
  useGetSelfTestResultsQuery,
  useRunSelfTestsMutation,
} = selfTestsApi;
export const { useGetDiagnosticsQuery } = diagnosticsApi;
