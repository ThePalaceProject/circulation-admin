import { BookData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

interface BookState {
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
  editError: null
};

export default (state: BookState = initialState, action) => {
  switch (action.type) {
    case "CLEAR_BOOK":
      return initialState;

    case "FETCH_BOOK_ADMIN_REQUEST":
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null,
        editError: null
      });

    case "EDIT_BOOK_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        editError: null
      });

    case "LOAD_BOOK_ADMIN":
      return Object.assign({}, state, {
        url: action.url,
        data: action.data,
        isFetching: false
      });

    case "FETCH_BOOK_ADMIN_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case "EDIT_BOOK_FAILURE":
      return Object.assign({}, state, {
        editError: action.error,
        isFetching: false
      });

    default:
      return state;
  }
};