import { RequestError } from "opds-web-client/lib/DataFetcher";
import { CollectionsData } from "../interfaces";
import ActionCreator from "../actions";

export interface CollectionsState {
  data: CollectionsData;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: CollectionsState = {
  data: null,
  isFetching: false,
  isEditing: false,
  fetchError: null,
  isLoaded: false
};

export default(state: CollectionsState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.COLLECTIONS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.COLLECTIONS_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.COLLECTIONS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.EDIT_COLLECTION_REQUEST:
      return Object.assign({}, state, {
        isEditing: true,
        fetchError: null
      });

    case ActionCreator.EDIT_COLLECTION_SUCCESS:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: null
      });

    case ActionCreator.EDIT_COLLECTION_FAILURE:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: action.error
      });

    default:
      return state;
  }
};