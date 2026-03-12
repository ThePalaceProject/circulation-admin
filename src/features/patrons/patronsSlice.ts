import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api/apiSlice";
import { PatronData } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function rtkErrorToFetchError(error: unknown): FetchErrorData | null {
  if (!error) return null;
  const e = error as any;
  return {
    status: e.status ?? 0,
    response: e.data?.detail ?? e.error ?? String(error),
    url: "",
  };
}

// ---------------------------------------------------------------------------
// API endpoints
// ---------------------------------------------------------------------------

export const patronsApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Look up a patron by identifier in a library. Returns PatronData. */
    patronLookup: build.mutation<
      PatronData,
      { data: FormData; library: string }
    >({
      query: ({ data, library }) => ({
        url: `/${library}/admin/manage_patrons`,
        method: "POST",
        body: data,
      }),
    }),

    /** Reset a patron's Adobe DRM ID. Returns a plain-text confirmation. */
    resetAdobeId: build.mutation<string, { data: FormData; library: string }>({
      query: ({ data, library }) => ({
        url: `/${library}/admin/manage_patrons/reset_adobe_id`,
        method: "POST",
        body: data,
        responseHandler: "text",
      }),
    }),

    /** Change the current admin's password. */
    changePassword: build.mutation<void, FormData>({
      query: (data) => ({
        url: "/admin/change_password",
        method: "POST",
        body: data,
        responseHandler: "text",
      }),
    }),
  }),
});

// ---------------------------------------------------------------------------
// UI slice – tracks patron state shared across connected components
// ---------------------------------------------------------------------------

export interface ChangePasswordUiState {
  isFetching: boolean;
  fetchError: FetchErrorData | null;
}

export interface PatronsUiState {
  /** Patron returned by the most recent successful lookup. */
  patron: PatronData | null;
  /** Error from the most recent patron lookup. */
  patronFetchError: FetchErrorData | null;
  /** Plain-text confirmation returned after a successful Adobe ID reset. */
  responseBody: string | null;
  /** Error from the most recent Adobe ID reset. */
  adobeIdFetchError: FetchErrorData | null;
  changePassword: ChangePasswordUiState;
}

const initialState: PatronsUiState = {
  patron: null,
  patronFetchError: null,
  responseBody: null,
  adobeIdFetchError: null,
  changePassword: { isFetching: false, fetchError: null },
};

export const patronsUiSlice = createSlice({
  name: "patronsUi",
  initialState,
  reducers: {
    /** Reset patron lookup state (called on component unmount to avoid stale data). */
    clearPatron: (state) => {
      state.patron = null;
      state.patronFetchError = null;
      state.responseBody = null;
      state.adobeIdFetchError = null;
    },
  },
  extraReducers: (builder) => {
    // patronLookup
    builder
      .addMatcher(patronsApi.endpoints.patronLookup.matchPending, (state) => {
        state.patronFetchError = null;
        state.patron = null;
      })
      .addMatcher(
        patronsApi.endpoints.patronLookup.matchFulfilled,
        (state, action) => {
          state.patron = action.payload;
          state.patronFetchError = null;
        }
      )
      .addMatcher(
        patronsApi.endpoints.patronLookup.matchRejected,
        (state, action) => {
          state.patron = null;
          state.patronFetchError = rtkErrorToFetchError(action.payload);
        }
      )
      // resetAdobeId
      .addMatcher(patronsApi.endpoints.resetAdobeId.matchPending, (state) => {
        state.responseBody = null;
        state.adobeIdFetchError = null;
      })
      .addMatcher(
        patronsApi.endpoints.resetAdobeId.matchFulfilled,
        (state, action) => {
          state.responseBody = action.payload;
          state.adobeIdFetchError = null;
        }
      )
      .addMatcher(
        patronsApi.endpoints.resetAdobeId.matchRejected,
        (state, action) => {
          state.adobeIdFetchError = rtkErrorToFetchError(action.payload);
        }
      )
      // changePassword
      .addMatcher(patronsApi.endpoints.changePassword.matchPending, (state) => {
        state.changePassword.isFetching = true;
        state.changePassword.fetchError = null;
      })
      .addMatcher(
        patronsApi.endpoints.changePassword.matchFulfilled,
        (state) => {
          state.changePassword.isFetching = false;
        }
      )
      .addMatcher(
        patronsApi.endpoints.changePassword.matchRejected,
        (state, action) => {
          state.changePassword.isFetching = false;
          state.changePassword.fetchError = rtkErrorToFetchError(
            action.payload
          );
        }
      );
  },
});

export const { clearPatron } = patronsUiSlice.actions;
