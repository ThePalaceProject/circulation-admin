import { LibrariesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LibrariesData>(ActionCreator.LIBRARIES, ActionCreator.EDIT_LIBRARY);
