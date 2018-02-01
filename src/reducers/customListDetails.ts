import { CustomListDetailsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CustomListDetailsData>(ActionCreator.CUSTOM_LIST_DETAILS);
