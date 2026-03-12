import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { api } from "../api/apiSlice";
import { LanesData, LaneData } from "../../interfaces";
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

export const lanesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLanes: build.query<LanesData, string>({
      query: (library) => `/${library}/admin/lanes`,
      providesTags: ["Lanes"],
    }),

    editLane: build.mutation<string, { library: string; data: FormData }>({
      query: ({ library, data }) => ({
        url: `/${library}/admin/lanes`,
        method: "POST",
        body: data,
        responseHandler: "text",
      }),
      invalidatesTags: ["Lanes"],
    }),

    deleteLane: build.mutation<void, { library: string; identifier: string }>({
      query: ({ library, identifier }) => ({
        url: `/${library}/admin/lane/${identifier}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: ["Lanes"],
    }),

    showLane: build.mutation<void, { library: string; identifier: string }>({
      query: ({ library, identifier }) => ({
        url: `/${library}/admin/lane/${identifier}/show`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: ["Lanes"],
    }),

    hideLane: build.mutation<void, { library: string; identifier: string }>({
      query: ({ library, identifier }) => ({
        url: `/${library}/admin/lane/${identifier}/hide`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: ["Lanes"],
    }),

    resetLanes: build.mutation<void, string>({
      query: (library) => ({
        url: `/${library}/admin/lanes/reset`,
        method: "POST",
        responseHandler: "text",
      }),
      invalidatesTags: ["Lanes"],
    }),

    changeLaneOrder: build.mutation<
      void,
      { library: string; lanes: LaneData[] }
    >({
      query: ({ library, lanes }) => ({
        url: `/${library}/admin/lanes/change_order`,
        method: "POST",
        body: lanes,
        // RTK Query fetchBaseQuery serializes objects/arrays as JSON and sets Content-Type automatically
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
          state.formError = rtkErrorToFetchError(action.error);
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
          state.formError = rtkErrorToFetchError(action.error);
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
          state.fetchError = rtkErrorToFetchError(action.error);
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
