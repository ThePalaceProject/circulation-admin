import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { api } from "../api/apiSlice";
import { LanesData, LaneData } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export function rtkErrorToFetchError(error: unknown): FetchErrorData | null {
  if (!error) return null;
  const e = error as any;
  // RTK Query rejection payload: { status: number|string, data: any, error?: string }
  // RTK SerializedError (action.error): { message: string } — always "Rejected", not useful
  const isRtkPayload =
    e.status !== undefined && (e.data !== undefined || e.error !== undefined);
  if (!isRtkPayload && e.message === "Rejected") return null; // swallow generic RTK noise
  const status = typeof e.status === "number" ? e.status : 0;
  const response =
    e.data?.detail ??
    e.data?.description ??
    (typeof e.data === "string" ? e.data : null) ??
    (typeof e.error === "string" ? e.error : null) ??
    e.message ??
    "An unexpected error occurred";
  return { status, response, url: "" };
}

export function isResultFetching(result: {
  isLoading?: boolean;
  isFetching?: boolean;
}): boolean {
  return !!(result?.isLoading || result?.isFetching);
}

export const lanesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLanes: build.query<LanesData, string>({
      query: (library) => `/${library}/admin/lanes`,
      providesTags: ["Lanes"],
    }),

    editLane: build.mutation<
      string,
      { library: string; data: FormData; csrfToken?: string }
    >({
      query: ({ library, data, csrfToken }) => ({
        url: `/${library}/admin/lanes`,
        method: "POST",
        body: data,
        responseHandler: "text",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      invalidatesTags: ["Lanes"],
    }),

    deleteLane: build.mutation<
      void,
      { library: string; identifier: string; csrfToken?: string }
    >({
      query: ({ library, identifier, csrfToken }) => ({
        url: `/${library}/admin/lane/${identifier}`,
        method: "DELETE",
        responseHandler: "text",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      invalidatesTags: ["Lanes"],
    }),

    showLane: build.mutation<
      void,
      { library: string; identifier: string; csrfToken?: string }
    >({
      query: ({ library, identifier, csrfToken }) => ({
        url: `/${library}/admin/lane/${identifier}/show`,
        method: "POST",
        responseHandler: "text",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      invalidatesTags: ["Lanes"],
    }),

    hideLane: build.mutation<
      void,
      { library: string; identifier: string; csrfToken?: string }
    >({
      query: ({ library, identifier, csrfToken }) => ({
        url: `/${library}/admin/lane/${identifier}/hide`,
        method: "POST",
        responseHandler: "text",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      invalidatesTags: ["Lanes"],
    }),

    resetLanes: build.mutation<void, { library: string; csrfToken?: string }>({
      query: ({ library, csrfToken }) => ({
        url: `/${library}/admin/lanes/reset`,
        method: "POST",
        responseHandler: "text",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      invalidatesTags: ["Lanes"],
    }),

    changeLaneOrder: build.mutation<
      void,
      { library: string; lanes: LaneData[]; csrfToken?: string }
    >({
      query: ({ library, lanes, csrfToken }) => ({
        url: `/${library}/admin/lanes/change_order`,
        method: "POST",
        body: lanes,
        // RTK Query fetchBaseQuery serializes objects/arrays as JSON and sets Content-Type automatically
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      }),
      // Caller (Lanes.tsx saveOrder) manually re-fetches via getLanes.initiate after this
    }),
  }),
});

// ---------------------------------------------------------------------------
// lanesUiSlice — tracks mutation loading/error states for mapStateToProps
// ---------------------------------------------------------------------------

export interface LanesUiState {
  isMutating: boolean;
  formError: FetchErrorData | null;
  fetchError: FetchErrorData | null;
}

const anyLaneMutationPending = isAnyOf(
  lanesApi.endpoints.editLane.matchPending,
  lanesApi.endpoints.deleteLane.matchPending,
  lanesApi.endpoints.showLane.matchPending,
  lanesApi.endpoints.hideLane.matchPending,
  lanesApi.endpoints.resetLanes.matchPending,
  lanesApi.endpoints.changeLaneOrder.matchPending
);

export const lanesUiSlice = createSlice({
  name: "lanesUi",
  initialState: {
    isMutating: false,
    formError: null,
    fetchError: null,
  } as LanesUiState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All mutations pending → clear errors, mark busy
      .addMatcher(anyLaneMutationPending, (state) => {
        state.isMutating = true;
        state.formError = null;
        state.fetchError = null;
      })

      // editLane success/failure → formError
      .addMatcher(lanesApi.endpoints.editLane.matchFulfilled, (state) => {
        state.isMutating = false;
      })
      .addMatcher(
        lanesApi.endpoints.editLane.matchRejected,
        (state, action) => {
          state.isMutating = false;
          state.formError = rtkErrorToFetchError(
            action.payload ?? action.error
          );
        }
      )

      // showLane / hideLane success/failure → formError
      .addMatcher(
        isAnyOf(
          lanesApi.endpoints.showLane.matchFulfilled,
          lanesApi.endpoints.hideLane.matchFulfilled
        ),
        (state) => {
          state.isMutating = false;
        }
      )
      .addMatcher(
        isAnyOf(
          lanesApi.endpoints.showLane.matchRejected,
          lanesApi.endpoints.hideLane.matchRejected
        ),
        (state, action) => {
          state.isMutating = false;
          state.formError = rtkErrorToFetchError(
            action.payload ?? action.error
          );
        }
      )

      // deleteLane / resetLanes / changeLaneOrder success/failure → fetchError
      .addMatcher(
        isAnyOf(
          lanesApi.endpoints.deleteLane.matchFulfilled,
          lanesApi.endpoints.resetLanes.matchFulfilled,
          lanesApi.endpoints.changeLaneOrder.matchFulfilled
        ),
        (state) => {
          state.isMutating = false;
        }
      )
      .addMatcher(
        isAnyOf(
          lanesApi.endpoints.deleteLane.matchRejected,
          lanesApi.endpoints.resetLanes.matchRejected,
          lanesApi.endpoints.changeLaneOrder.matchRejected
        ),
        (state, action) => {
          state.isMutating = false;
          state.fetchError = rtkErrorToFetchError(
            action.payload ?? action.error
          );
        }
      );
  },
});

export const {
  useGetLanesQuery,
  useEditLaneMutation,
  useDeleteLaneMutation,
  useShowLaneMutation,
  useHideLaneMutation,
  useResetLanesMutation,
  useChangeLaneOrderMutation,
} = lanesApi;
