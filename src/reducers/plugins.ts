import { PluginData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<PluginData>(ActionCreator.PLUGINS);
