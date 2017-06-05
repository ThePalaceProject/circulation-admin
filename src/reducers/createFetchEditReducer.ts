import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface FetchEditState<T> {
  data: T | null;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError | null;
  isLoaded: boolean;
}

export interface FetchEditReducer<T> {
  (state: FetchEditState<T>, action): FetchEditState<T>;
}

export default<T> (fetchPrefix: string, editPrefix: string): FetchEditReducer<T> => {
  const initialState: FetchEditState<T> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false
  };

  const fetchEditReducer = (state: FetchEditState<T> = initialState, action): FetchEditState<T> => {
    switch (action.type) {
      case `${fetchPrefix}_${ActionCreator.REQUEST}`:
        return Object.assign({}, state, {
          isFetching: true,
          fetchError: null
        });

      case `${fetchPrefix}_${ActionCreator.FAILURE}`:
        return Object.assign({}, state, {
          fetchError: action.error,
          isFetching: false,
          isLoaded: true
        });

      case `${fetchPrefix}_${ActionCreator.LOAD}`:
        return Object.assign({}, state, {
          data: action.data,
          isFetching: false,
          isLoaded: true
        });

      case `${editPrefix}_${ActionCreator.REQUEST}`:
        return Object.assign({}, state, {
          isEditing: true,
          fetchError: null
        });

      case `${editPrefix}_${ActionCreator.SUCCESS}`:
        return Object.assign({}, state, {
          isEditing: false,
          fetchError: null
        });

      case `${editPrefix}_${ActionCreator.FAILURE}`:
        return Object.assign({}, state, {
          isEditing: false,
          fetchError: action.error
        });

      default:
        return state;
    }
  };
  return fetchEditReducer;
};
