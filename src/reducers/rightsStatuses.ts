import { RightsStatusData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<RightsStatusData>(ActionCreator.RIGHTS_STATUSES);