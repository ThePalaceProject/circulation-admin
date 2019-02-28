import { SearchServicesData } from "../interfaces";
import { extraActions } from "./hasSelfTests";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<SearchServicesData>(
  ActionCreator.SEARCH_SERVICES,
  ActionCreator.EDIT_SEARCH_SERVICE,
  extraActions
);
