import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

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
    case "FETCH_GENRE_TREE_REQUEST":
      return Object.assign({}, state, {
        isFetchingGenreTree: true,
        fetchError: null
      });

    case "FETCH_GENRE_TREE_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetchingGenreTree: false
      });

    case "LOAD_GENRE_TREE":
      return Object.assign({}, state, {
        genreTree: action.data,
        isFetchingGenreTree: false,
      });

    case "EDIT_CLASSIFICATIONS_REQUEST":
      return Object.assign({}, state, {
        isEditingClassifications: true,
        fetchError: null
      });

    case "EDIT_CLASSIFICATIONS_SUCCESS":
      return Object.assign({}, state, {
        isEditingClassifications: false,
        fetchError: null
      });

    case "EDIT_CLASSIFICATIONS_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isEditingClassifications: false
      });

    case "FETCH_CLASSIFICATIONS_REQUEST":
      return Object.assign({}, state, {
        classifications: null,
        isFetchingClassifications: true,
        fetchError: null
      });

    case "FETCH_CLASSIFICATIONS_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetchingClassifications: false
      });

    case "LOAD_CLASSIFICATIONS":
      return Object.assign({}, state, {
        classifications: action.classifications,
        isFetchingClassifications: false
      });

    default:
      return state;
  }
}