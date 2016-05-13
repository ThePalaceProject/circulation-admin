import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

export interface ClassificationsState {
  genres: GenreTree;
  classifications: ClassificationData[];
  isFetchingGenres: boolean;
  isEditingClassifications: boolean;
  isFetchingClassifications: boolean;
  fetchError: RequestError;
}

const initialState: ClassificationsState = {
  genres: null,
  classifications: null,
  isFetchingGenres: false,
  isEditingClassifications: false,
  isFetchingClassifications: false,
  fetchError: null
};

export default (state: ClassificationsState = initialState, action): ClassificationsState => {
  switch (action.type) {
    case "FETCH_GENRES_REQUEST":
      return Object.assign({}, state, {
        isFetchingGenres: true,
        fetchError: null
      });

    case "FETCH_GENRES_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetchingGenres: false
      });

    case "LOAD_GENRES":
      return Object.assign({}, state, {
        genres: action.data,
        isFetchingGenres: false,
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