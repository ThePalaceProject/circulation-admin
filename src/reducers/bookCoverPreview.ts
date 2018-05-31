import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface BookCoverPreviewState {
  data: string;
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: BookCoverPreviewState = {
  data: null,
  isFetching: false,
  fetchError: null
};

export default (state: BookCoverPreviewState = initialState, action): BookCoverPreviewState => {
  switch (action.type) {
    case `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.REQUEST}`:
      return Object.assign({}, state, {
        data: null,
        isFetching: true,
        fetchError: null
      });

    case `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.FAILURE}`:
      return Object.assign({}, state, {
        data: null,
        isFetching: false,
        fetchError: action.error
      });

    case `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.LOAD}`:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        fetchError: null
      });

    case `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.CLEAR}`:
      return Object.assign({}, state, {
        data: null,
        isFetching: false,
        fetchError: null
      });

    default:
      return state;
  }
};