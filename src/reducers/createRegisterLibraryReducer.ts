import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface RegisterLibraryState {
  isFetching: boolean;
  fetchError: RequestError;
}

export interface RegisterLibraryReducer {
  (state: RegisterLibraryState, action): RegisterLibraryState;
}

export default<T>(registerPrefix: string): RegisterLibraryReducer => {
  const initialState: RegisterLibraryState = {
    isFetching: false,
    fetchError: null
  };

  const registerLibraryReducer = (state: RegisterLibraryState = initialState, action): RegisterLibraryState => {
    switch (action.type) {
      case `${registerPrefix}_${ActionCreator.REQUEST}`:
        return Object.assign({}, state, {
          isFetching: true,
          fetchError: null
        });

      case `${registerPrefix}_${ActionCreator.FAILURE}`:
        return Object.assign({}, state, {
          isFetching: false,
          fetchError: action.error
        });

      case `${registerPrefix}_${ActionCreator.SUCCESS}`:
        return Object.assign({}, state, {
          isFetching: false,
          fetchError: null
        });

      default:
        return state;
    }
  };
  return registerLibraryReducer;
};