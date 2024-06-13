import { createSlice } from "@reduxjs/toolkit";
import { BookData } from "../../interfaces";
import { RequestError } from "@thepalaceproject/web-opds-client/lib/DataFetcher";

export interface BookState {
  url: string;
  data: BookData;
  isFetching: boolean;
  fetchError: RequestError;
  editError: RequestError;
}

const initialState: BookState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  editError: null,
};

const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    bookCleared(state) {
      state = initialState;
    },
    bookAdminRequested(state, action) {
      const { url } = action.payload;
      state = {
        ...state,
        url,
        isFetching: true,
        fetchError: null,
        editError: null,
      };
    },
    bookAdminLoaded(state, action) {
      const { url, data } = action.payload;
      state = { ...state, url, data, isFetching: false };
    },
    bookAdminFailed(state, action) {
      const { url, error } = action.payload;
      state = { ...state, url, isFetching: false, fetchError: error };
    },
    editBookRequested(state, action) {
      state = { ...state, isFetching: true, editError: null };
    },
    editBookFailed(state, action) {
      const { error } = action.payload;
      state = { ...state, isFetching: false, editError: error };
    },
  },
});

export const {
  bookCleared,
  bookAdminRequested,
  bookAdminLoaded,
  bookAdminFailed,
  editBookRequested,
  editBookFailed,
} = bookSlice.actions;

export default bookSlice.reducer;
