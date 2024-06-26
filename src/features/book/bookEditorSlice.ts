import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BookData } from "../../interfaces";
import DataFetcher, {
  RequestError,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import editorAdapter from "../../editorAdapter";
import { submitForm } from "../../api/submitForm";
import { RootState } from "../../store";
import ActionCreator from "../../actions";

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
      .addCase(ActionCreator.BOOK_CLEAR, (state, action) => {
        // Handle resetting the book data via actions from the web-opds-client.
        console.log("*** Handling clear book data action ***", action.type, {
          action,
          state,
        });
        return initialState;
      })
      .addCase(getBookData.pending, (state, action) => {
        // console.log("getBookData.pending", { action, state });
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
      .addCase(submitBookData.pending, (state, action) => {
        state.isFetching = true;
        state.editError = null;
      })
      .addCase(submitBookData.fulfilled, (state, action) => {
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

export const submitBookData = createAsyncThunk(
  bookEditorSlice.reducerPath + "/submitBookData",
  async (
    {
      url,
      data,
      csrfToken = undefined,
    }: { url: string; data: FormData; csrfToken?: string },
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

export const bookEditorActions = {
  ...bookEditorSlice.actions,
};
export default bookEditorSlice.reducer;
