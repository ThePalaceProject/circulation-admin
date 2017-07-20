import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface RegisterLibraryState {
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: RegisterLibraryState = {
  isFetching: false,
  fetchError: null
};

export default (state: RegisterLibraryState = initialState, action) => {
  switch (action.type) {
    case `${ActionCreator.REGISTER_LIBRARY}_${ActionCreator.REQUEST}`:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case `${ActionCreator.REGISTER_LIBRARY}_${ActionCreator.FAILURE}`:
      return Object.assign({}, state, {
        isFetching: false,
        fetchError: action.error
      });

    case `${ActionCreator.REGISTER_LIBRARY}_${ActionCreator.SUCCESS}`:
      return Object.assign({}, state, {
        isFetching: false,
        fetchError: null
      });

    default:
      return state;
  }
};