import { RequestError } from "opds-web-client/lib/DataFetcher";
import { AdminAuthServicesData } from "../interfaces";
import ActionCreator from "../actions";

export interface AdminAuthServicesState {
  data: AdminAuthServicesData;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: AdminAuthServicesState = {
  data: null,
  isFetching: false,
  isEditing: false,
  fetchError: null,
  isLoaded: false
};

export default(state: AdminAuthServicesState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.ADMIN_AUTH_SERVICES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.ADMIN_AUTH_SERVICES_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.ADMIN_AUTH_SERVICES_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.EDIT_ADMIN_AUTH_SERVICE_REQUEST:
      return Object.assign({}, state, {
        isEditing: true,
        fetchError: null
      });

    case ActionCreator.EDIT_ADMIN_AUTH_SERVICE_SUCCESS:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: null
      });

    case ActionCreator.EDIT_ADMIN_AUTH_SERVICE_FAILURE:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: action.error
      });

    default:
      return state;
  }
};