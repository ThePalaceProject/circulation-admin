import { CirculationEventData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";

export interface CirculationEventsState {
  data: CirculationEventData[];
  isFetching: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: CirculationEventsState = {
  data: null,
  isFetching: false,
  fetchError: null,
  isLoaded: false
};

export default (state: CirculationEventsState = initialState, action) => {
  switch (action.type) {
    case "FETCH_CIRCULATION_EVENTS_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case "LOAD_CIRCULATION_EVENTS":
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case "FETCH_CIRCULATION_EVENTS_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    default:
      return state;
  }
};