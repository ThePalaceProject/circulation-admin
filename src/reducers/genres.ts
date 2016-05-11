import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

export interface GenresState {
  genres: GenreTree;
  classifications: ClassificationData[];
  isFetchingGenres: boolean;
  isUpdatingGenres: boolean;
  isFetchingClassifications: boolean;
  fetchError: RequestError;
}

const initialState: GenresState = {
  genres: null,
  classifications: null,
  isFetchingGenres: false,
  isUpdatingGenres: false,
  isFetchingClassifications: false,
  fetchError: null
};

export default (state: GenresState = initialState, action): GenresState => {
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

    case "UPDATE_GENRES_REQUEST":
      return Object.assign({}, state, {
        isUpdatingGenres: true,
        fetchError: null
      });

    case "UPDATE_GENRES_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isUpdatingGenres: false
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