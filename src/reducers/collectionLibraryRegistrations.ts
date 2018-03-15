import { LibraryRegistrationsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LibraryRegistrationsData>(ActionCreator.COLLECTION_LIBRARY_REGISTRATIONS);
