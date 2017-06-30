import { CDNServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CDNServicesData>(ActionCreator.CDN_SERVICES, ActionCreator.EDIT_CDN_SERVICE);
