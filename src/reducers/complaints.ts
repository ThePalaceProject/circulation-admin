import { ComplaintsData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface ComplaintsState {
  url: string;
  data: ComplaintsData;
  isFetching: boolean;
  fetchError: RequestError;
  postError: RequestError;
  resolveError: RequestError;
}

const initialState: ComplaintsState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  postError: null,
  resolveError: null
};

export default (state: ComplaintsState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.RESOLVE_COMPLAINTS_REQUEST:
    case ActionCreator.POST_COMPLAINT_REQUEST:
    case ActionCreator.COMPLAINTS_REQUEST:
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.COMPLAINTS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case ActionCreator.POST_COMPLAINT_FAILURE:
      return Object.assign({}, state, {
        postError: action.error,
        isFetching: false
      });

    case ActionCreator.RESOLVE_COMPLAINTS_FAILURE:
      return Object.assign({}, state, {
        resolveError: action.error,
        isFetching: false
      });

    case ActionCreator.COMPLAINTS_LOAD:
      return Object.assign({}, state, {
        data: action.data.complaints,
        isFetching: false
      });

    default:
      return state;
  }
};