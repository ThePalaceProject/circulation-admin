import { StorageServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<StorageServicesData>(ActionCreator.SEARCH_SERVICES, ActionCreator.EDIT_SEARCH_SERVICE);
