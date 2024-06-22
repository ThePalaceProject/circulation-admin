import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BookData } from "../../interfaces";
import DataFetcher, {
  RequestError,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import editorAdapter from "../../editorAdapter";

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
  reducers: {
    bookCleared(state, action) {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookData.pending, (state, action) => {
        // console.log("getBookData.pending", { action, state });
        const { url } = action.meta.arg;
        state.url = url;
        state.data = null;
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(getBookData.fulfilled, (state, action) => {
        // console.log("getBookData.fulfilled", { action, state });
        const { url } = action.meta.arg;
        state.url = url;
        state.data = action.payload as BookData;
        state.isFetching = false;
        state.fetchError = null;
      })
      .addCase(getBookData.rejected, (state, action) => {
        // console.log("getBookData.rejected", { action, state });
        const { url } = action.meta.arg;
        state.url = url;
        state.data = null;
        state.isFetching = false;
        state.fetchError = action.payload as RequestError;
      })
      .addMatcher(
        (action) => true,
        (state, action) => {
          // console.log("Unhandled action", action.type, {action, state});
        }
      );
  },
});

export const getBookData = createAsyncThunk(
  bookEditorSlice.reducerPath + "/getBookData",
  async ({ url }: { url: string }, thunkAPI) => {
    // console.log("getBookData thunkAPI", thunkAPI);
    const fetcher = new DataFetcher({ adapter: editorAdapter });
    try {
      const result = await fetcher.fetchOPDSData(url);
      // console.log(bookEditorSlice.reducerPath + "/getBookData()", {url, result});
      return result;
    } catch (e) {
      // console.log(bookEditorSlice.reducerPath + "/getBookData()", {url, e});
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const bookEditorActions = {
  ...bookEditorSlice.actions,
};
export default bookEditorSlice.reducer;
