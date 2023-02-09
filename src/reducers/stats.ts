import { RequestError } from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import { StatsData } from "../interfaces";
import ActionCreator from "../actions";
import { CombinedState } from "../store";

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
  isLoaded: false,
};

/** Map application state to StatsState properties. */
export const stateSelector = {
  data: (state: CombinedState) => state.editor.stats.data,
  isLoaded: (state: CombinedState) => state.editor.stats.isLoaded,
  isFetching: (state: CombinedState) => state.editor.stats.isFetching,
  fetchError: (state: CombinedState) => state.editor.stats.fetchError,
};

export default (state: StatsState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.STATS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null,
      });

    case ActionCreator.STATS_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true,
      });

    case ActionCreator.STATS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true,
      });

    default:
      return state;
  }
};
