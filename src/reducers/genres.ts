import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

export interface GenresState {
  genres: GenreTree;
  classifications: ClassificationData[];
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: GenresState = {
  genres: null,
  classifications: null,
  isFetching: false,
  fetchError: null
};

export default (state: GenresState = initialState, action): GenresState => {
  switch (action.type) {
    case "FETCH_GENRES_REQUEST":
    case "UPDATE_GENRES_REQUEST":
    case "FETCH_CLASSIFICATIONS_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case "FETCH_CLASSIFICATIONS_FAILURE":
    case "UPDATE_GENRES_FAILURE":
    case "FETCH_GENRES_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case "LOAD_GENRES":
      return Object.assign({}, state, {
        genres: action.data
      });

    case "LOAD_CLASSIFICATIONS":
      return Object.assign({}, state, {
        classifications: action.classifications
      });

    default:
      return state;
  }
}