import { LibraryRegistrationsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<LibraryRegistrationsData>(ActionCreator.DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS);
