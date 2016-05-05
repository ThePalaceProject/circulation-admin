import { GenreTree, ClassificationData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

interface GenresState {
  genres: GenreTree;
  classifications: ClassificationData[];
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: GenresState = {
  genres: null,
  classifications: null,
  isFetching: false,
  fetchError: null,
};

export default (state: GenresState = initialState, action): GenresState => {
  switch (action.type) {
    case "LOAD_GENRES":
      return Object.assign({}, state, {
        genres: action.data
      });

    case "LOAD_CLASSIFICATIONS":
    return Object.assign({}, state, {
      classifications: action.data.classifications
    });

    default:
      return state;
  }
}