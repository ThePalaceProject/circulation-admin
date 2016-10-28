import { RequestError } from "opds-web-client/lib/DataFetcher";
import { StatsData } from "../interfaces";

export interface StatsState {
  data: StatsData;
  isFetching: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: StatsState = {
  data: null,
  isFetching: false,
  fetchError: null,
  isLoaded: false
};

export default (state: StatsState = initialState, action) => {
  switch (action.type) {
    case "FETCH_STATS_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case "LOAD_STATS":
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case "FETCH_STATS_FAILURE":
       return Object.assign({}, state, {
         fetchError: action.error,
         isFetching: false,
         isLoaded: true
       });

     default:
       return state;
  }
};