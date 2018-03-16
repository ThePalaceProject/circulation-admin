import { LoggingServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LoggingServicesData>(ActionCreator.LOGGING_SERVICES, ActionCreator.EDIT_LOGGING_SERVICE);
