import { LoggingSettingsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LoggingSettingsData>(ActionCreator.LOGGING_SETTINGS, ActionCreator.EDIT_LOGGING_SETTING);
