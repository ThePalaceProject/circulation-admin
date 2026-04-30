import { GlobalSettingsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<GlobalSettingsData>(
  ActionCreator.GLOBAL_SETTINGS
);
