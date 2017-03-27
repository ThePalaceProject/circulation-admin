import { RequestError } from "opds-web-client/lib/DataFetcher";
import { LibrariesData } from "../interfaces";
import ActionCreator from "../actions";

export interface LibrariesState {
  data: LibrariesData;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: LibrariesState = {
  data: null,
  isFetching: false,
  isEditing: false,
  fetchError: null,
  isLoaded: false
};

export default(state: LibrariesState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.LIBRARIES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.LIBRARIES_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.LIBRARIES_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.EDIT_LIBRARY_REQUEST:
      return Object.assign({}, state, {
        isEditing: true,
        fetchError: null
      });

    case ActionCreator.EDIT_LIBRARY_SUCCESS:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: null
      });

    case ActionCreator.EDIT_LIBRARY_FAILURE:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: action.error
      });

    default:
      return state;
  }
};