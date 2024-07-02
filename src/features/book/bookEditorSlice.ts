import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BookData } from "../../interfaces";
import DataFetcher, {
  RequestError,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import editorAdapter from "../../editorAdapter";
import { submitForm } from "../../api/submitForm";
import { RootState } from "../../store";
import ActionCreator from "../../actions";
import { api } from "../api/apiSlice";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  MutationActionCreatorResult,
  MutationDefinition,
} from "@reduxjs/toolkit/query";

export const PER_LIBRARY_SUPPRESS_REL =
  "http://palaceproject.io/terms/rel/suppress-for-library";
export const PER_LIBRARY_UNSUPPRESS_REL =
  "http://palaceproject.io/terms/rel/unsuppress-for-library";

export interface BookState {
  url: string;
  data: BookData;
  isFetching: boolean;
  fetchError: RequestError;
  editError: RequestError;
}

export const initialState: BookState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  editError: null,
};

interface InitialState {
  url: string;
  data: BookData;
  isFetching: boolean;
  fetchError: RequestError;
}

const bookEditorSlice = createSlice({
  name: "bookEditor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(ActionCreator.BOOK_CLEAR, () => {
        // Handle resetting the book data via actions from the web-opds-client.
        return initialState;
      })
      .addCase(getBookData.pending, (state, action) => {
        const { url } = action.meta.arg;
        state.url = url;
        state.data = null;
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(getBookData.fulfilled, (state, action) => {
        const { url } = action.meta.arg;
        state.url = url;
        state.data = action.payload as BookData;
        state.isFetching = false;
        state.fetchError = null;
      })
      .addCase(getBookData.rejected, (state, action) => {
        const { url } = action.meta.arg;
        state.url = url;
        state.data = null;
        state.isFetching = false;
        state.fetchError = action.payload as RequestError;
      })
      .addCase(submitBookData.pending, (state) => {
        state.isFetching = true;
        state.editError = null;
      })
      .addCase(submitBookData.fulfilled, (state) => {
        state.isFetching = false;
        state.editError = null;
      })
      .addCase(submitBookData.rejected, (state, action) => {
        state.isFetching = false;
        state.editError = action.payload as RequestError;
      });
  },
});

export type GetBookDataArgs = {
  url: string;
};

export const getBookData = createAsyncThunk(
  bookEditorSlice.reducerPath + "/getBookData",
  async ({ url }: GetBookDataArgs, thunkAPI) => {
    const fetcher = new DataFetcher({ adapter: editorAdapter });
    try {
      const result = await fetcher.fetchOPDSData(url);
      return result;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export type SubmitBookDataArgs = {
  url: string;
  data: FormData;
  csrfToken?: string;
};

export const submitBookData = createAsyncThunk(
  bookEditorSlice.reducerPath + "/submitBookData",
  async (
    { url, data, csrfToken = undefined }: SubmitBookDataArgs,
    thunkAPI
  ) => {
    try {
      const result = await submitForm(url, { data, csrfToken });
      // If we've successfully submitted the form, we need to re-fetch the book data.
      const {
        bookEditor: { url: bookAdminUrl },
      } = thunkAPI.getState() as RootState;
      const reFetchBookData = getBookData({ url: bookAdminUrl });
      thunkAPI.dispatch(reFetchBookData);
      // And finally, we return our result for fulfillment.
      return result;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export type SuppressionMutationMethodType = MutationActionCreatorResult<
  MutationDefinition<
    SuppressionMutationArg,
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError,
      object,
      FetchBaseQueryMeta
    >,
    any,
    SuppressionResponse,
    "api"
  >
>;

export type SuppressionMutationArg = {
  url: string;
  csrfToken?: string;
};

export type SuppressionResponse = {
  status?: number;
  message?: string;
};

export const bookEditorApiEndpoints = api.injectEndpoints({
  endpoints: (build) => ({
    suppressBook: build.mutation<SuppressionResponse, SuppressionMutationArg>({
      query: ({ url, csrfToken }) => ({
        url,
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
      }),
    }),
    unsuppressBook: build.mutation<SuppressionResponse, SuppressionMutationArg>(
      {
        query: ({ url, csrfToken }) => ({
          url,
          method: "DELETE",
          headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
        }),
      }
    ),
  }),
});

export const bookEditorActions = {
  ...bookEditorSlice.actions,
};
export default bookEditorSlice.reducer;
