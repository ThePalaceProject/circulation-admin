import { MetadataServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<MetadataServicesData>(ActionCreator.METADATA_SERVICES, ActionCreator.EDIT_METADATA_SERVICE);
