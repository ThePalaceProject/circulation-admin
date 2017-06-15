import { SitewideSettingsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<SitewideSettingsData>(ActionCreator.SITEWIDE_SETTINGS, ActionCreator.EDIT_SITEWIDE_SETTING);
