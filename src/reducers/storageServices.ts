import { StorageServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<StorageServicesData>(ActionCreator.STORAGE_SERVICES, ActionCreator.EDIT_STORAGE_SERVICE);
