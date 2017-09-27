import { LibraryRegistrationsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LibraryRegistrationsData>(ActionCreator.LIBRARY_REGISTRATIONS);
