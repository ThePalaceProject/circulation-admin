import { LanesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LanesData>(ActionCreator.LANES, ActionCreator.EDIT_LANE);
