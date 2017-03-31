import { BookData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

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
  editError: null
};

export default (state: BookState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.BOOK_CLEAR:
      return initialState;

    case ActionCreator.BOOK_ADMIN_REQUEST:
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null,
        editError: null
      });

    case ActionCreator.EDIT_BOOK_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        editError: null
      });

    case ActionCreator.BOOK_ADMIN_LOAD:
      return Object.assign({}, state, {
        url: action.url,
        data: action.data,
        isFetching: false
      });

    case ActionCreator.BOOK_ADMIN_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case ActionCreator.EDIT_BOOK_FAILURE:
      return Object.assign({}, state, {
        editError: action.error,
        isFetching: false
      });

    default:
      return state;
  }
};