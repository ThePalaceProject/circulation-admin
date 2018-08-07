import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface FetchEditState<T> {
  data: T | null;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError | null;
  isLoaded: boolean;
  editedIdentifier?: string;
}

export interface FetchEditReducer<T> {
  (state: FetchEditState<T>, action): FetchEditState<T>;
}

export default<T> (fetchPrefix: string, editPrefix?: string, extraAction?: string, manipulateData?): FetchEditReducer<T> => {
  const initialState: FetchEditState<T> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false,
    editedIdentifier: null
  };

  const fetchEditReducer = (state: FetchEditState<T> = initialState, action): FetchEditState<T> => {
    switch (action.type) {
      case `${fetchPrefix}_${ActionCreator.REQUEST}`:
        return Object.assign({}, state, {
          data: null,
          isLoaded: false,
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

      default:
        if (extraAction) {
          switch (action.type) {
            case `${extraAction}_${ActionCreator.REQUEST}`:
              return Object.assign({}, state, {
                data: state.data,
                isLoaded: false,
                isFetching: true,
                fetchError: null
              });
            case `${extraAction}_${ActionCreator.SUCCESS}`:
              return Object.assign({}, state, {
                fetchError: null
              });
            case `${extraAction}_${ActionCreator.FAILURE}`:
              return Object.assign({}, state, {
                fetchError: action.error,
                isFetching: false,
                isLoaded: true
              });
            case `${extraAction}_${ActionCreator.LOAD}`:
              const data = manipulateData ?
                manipulateData(state.data, action) : state.data;
              return Object.assign({}, state, {
                data: data,
                isFetching: false,
                isLoaded: true
              });
            default:
              return state;
          }
        }

        if (editPrefix) {
          switch (action.type) {
            case `${editPrefix}_${ActionCreator.REQUEST}`:
              return Object.assign({}, state, {
                isEditing: true,
                fetchError: null,
                editedIdentifier: null
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

            case `${editPrefix}_${ActionCreator.LOAD}`:
              return Object.assign({}, state, {
                editedIdentifier: action.data
              });

            default:
              return state;
          }
        }
        return state;
    }
  };
  return fetchEditReducer;
};
