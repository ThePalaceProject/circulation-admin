import { GenreTree, SubjectData } from "../interfaces";
import { RequestError } from "opds-browser/lib/DataFetcher";

interface GenresState {
  genres: GenreTree;
  subjects: SubjectData[];
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: GenresState = {
  genres: null,
  subjects: null,
  isFetching: false,
  fetchError: null,
};

export default (state: GenresState = initialState, action) => {
  switch (action.type) {
    case "LOAD_GENRES":
      return Object.assign({}, state, {
        genres: action.data
      });

    case "LOAD_SUBJECTS":
    return Object.assign({}, state, {
      subjects: action.data.subjects
    });

    default:
      return state;
  }
}