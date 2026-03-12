import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api/apiSlice";
import {
  ComplaintsData,
  GenreTree,
  ClassificationData,
} from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isResultFetching(result: any): boolean {
  return !!(result?.isFetching || result?.isLoading);
}

export function rtkErrorToFetchError(error: unknown): FetchErrorData | null {
  if (!error) return null;
  const e = error as any;
  return {
    status: e.status ?? 0,
    response: e.data?.detail ?? e.error ?? String(error),
    url: "",
  };
}

// ── RTK Query endpoints ───────────────────────────────────────────────────────

export const bookMetadataApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Complaints
    getComplaints: build.query<ComplaintsData, string>({
      query: (url) => url,
      providesTags: (_result, _error, url) => [{ type: "Complaints", id: url }],
    }),

    postComplaint: build.mutation<
      void,
      { url: string; data: { type: string } }
    >({
      query: ({ url, data }) => ({
        url,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      invalidatesTags: (_result, _error, { url }) => [
        { type: "Complaints", id: url },
      ],
    }),

    resolveComplaints: build.mutation<void, { url: string; data: FormData }>({
      query: ({ url, data }) => ({ url, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { url }) => [
        { type: "Complaints", id: url },
      ],
    }),

    // Classifications
    getGenreTree: build.query<GenreTree, string>({
      query: (url) => url,
    }),

    getClassifications: build.query<
      { classifications: ClassificationData[] },
      string
    >({
      query: (url) => url,
      providesTags: (_result, _error, url) => [
        { type: "Classifications", id: url },
      ],
    }),

    editClassifications: build.mutation<void, { url: string; data: FormData }>({
      query: ({ url, data }) => ({ url, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { url }) => [
        { type: "Classifications", id: url },
      ],
    }),

    // Book Cover
    editBookCover: build.mutation<void, { url: string; data: FormData }>({
      query: ({ url, data }) => ({ url, method: "POST", body: data }),
    }),

    previewBookCover: build.mutation<string, { url: string; data: FormData }>({
      query: ({ url, data }) => ({
        url,
        method: "POST",
        body: data,
        responseHandler: async (response) => {
          // Try JSON first (may be a JSON-encoded URL string), fall back to text
          try {
            return await response.clone().json();
          } catch {
            return response.text();
          }
        },
      }),
    }),
  }),
});

// ── Local slice for book cover preview state ──────────────────────────────────
// Not stored in RTK Query cache — kept in the editor combined reducer so
// BookCoverEditor can still read state.editor.bookCoverPreview.*

export interface BookCoverPreviewState {
  data: string | null;
  isFetching: boolean;
  fetchError: FetchErrorData | null;
}

const initialState: BookCoverPreviewState = {
  data: null,
  isFetching: false,
  fetchError: null,
};

export const bookCoverPreviewSlice = createSlice({
  name: "bookCoverPreview",
  initialState,
  reducers: {
    clear: (state) => {
      state.data = null;
      state.isFetching = false;
      state.fetchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        bookMetadataApi.endpoints.previewBookCover.matchPending,
        (state) => {
          state.data = null;
          state.isFetching = true;
          state.fetchError = null;
        }
      )
      .addMatcher(
        bookMetadataApi.endpoints.previewBookCover.matchFulfilled,
        (state, action) => {
          state.data = action.payload;
          state.isFetching = false;
          state.fetchError = null;
        }
      )
      .addMatcher(
        bookMetadataApi.endpoints.previewBookCover.matchRejected,
        (state, action) => {
          state.data = null;
          state.isFetching = false;
          state.fetchError = rtkErrorToFetchError(action.error);
        }
      );
  },
});

export const { clear: clearBookCoverPreview } = bookCoverPreviewSlice.actions;

export const {
  useGetComplaintsQuery,
  usePostComplaintMutation,
  useResolveComplaintsMutation,
  useGetGenreTreeQuery,
  useGetClassificationsQuery,
  useEditClassificationsMutation,
  useEditBookCoverMutation,
  usePreviewBookCoverMutation,
} = bookMetadataApi;
