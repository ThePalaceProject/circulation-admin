import { DiscoveryServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<DiscoveryServicesData>(ActionCreator.DISCOVERY_SERVICES, ActionCreator.EDIT_DISCOVERY_SERVICE);
