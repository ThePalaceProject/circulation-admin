import { DRMServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<DRMServicesData>(ActionCreator.DRM_SERVICES, ActionCreator.EDIT_DRM_SERVICE);
