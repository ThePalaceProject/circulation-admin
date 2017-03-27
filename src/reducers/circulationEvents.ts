import { CirculationEventData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

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
    case ActionCreator.CIRCULATION_EVENTS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.CIRCULATION_EVENTS_LOAD:
      return Object.assign({}, state, {
        data: action.data.circulation_events,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.CIRCULATION_EVENTS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    default:
      return state;
  }
};