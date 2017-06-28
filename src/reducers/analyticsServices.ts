import { AnalyticsServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<AnalyticsServicesData>(ActionCreator.ANALYTICS_SERVICES, ActionCreator.EDIT_ANALYTICS_SERVICE);
