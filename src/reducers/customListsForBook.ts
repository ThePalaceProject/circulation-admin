import { CustomListsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CustomListsData>(ActionCreator.CUSTOM_LISTS_FOR_BOOK, ActionCreator.EDIT_CUSTOM_LISTS_FOR_BOOK);
