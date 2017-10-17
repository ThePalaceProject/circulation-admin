import { CustomListsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CustomListsData>(ActionCreator.CUSTOM_LISTS, ActionCreator.EDIT_CUSTOM_LIST);
