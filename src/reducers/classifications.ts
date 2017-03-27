import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface ClassificationsState {
  genreTree: GenreTree;
  classifications: ClassificationData[];
  isFetchingGenreTree: boolean;
  isEditingClassifications: boolean;
  isFetchingClassifications: boolean;
  fetchError: RequestError;
}

const initialState: ClassificationsState = {
  genreTree: null,
  classifications: null,
  isFetchingGenreTree: false,
  isEditingClassifications: false,
  isFetchingClassifications: false,
  fetchError: null
};

export default (state: ClassificationsState = initialState, action): ClassificationsState => {
  switch (action.type) {
    case ActionCreator.GENRE_TREE_REQUEST:
      return Object.assign({}, state, {
        isFetchingGenreTree: true,
        fetchError: null
      });

    case ActionCreator.GENRE_TREE_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetchingGenreTree: false
      });

    case ActionCreator.GENRE_TREE_LOAD:
      return Object.assign({}, state, {
        genreTree: action.data,
        isFetchingGenreTree: false,
      });

    case ActionCreator.EDIT_CLASSIFICATIONS_REQUEST:
      return Object.assign({}, state, {
        isEditingClassifications: true,
        fetchError: null
      });

    case ActionCreator.EDIT_CLASSIFICATIONS_SUCCESS:
      return Object.assign({}, state, {
        isEditingClassifications: false,
        fetchError: null
      });

    case ActionCreator.EDIT_CLASSIFICATIONS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isEditingClassifications: false
      });

    case ActionCreator.CLASSIFICATIONS_REQUEST:
      return Object.assign({}, state, {
        classifications: null,
        isFetchingClassifications: true,
        fetchError: null
      });

    case ActionCreator.CLASSIFICATIONS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetchingClassifications: false
      });

    case ActionCreator.CLASSIFICATIONS_LOAD:
      return Object.assign({}, state, {
        classifications: action.data.classifications,
        isFetchingClassifications: false
      });

    default:
      return state;
  }
};