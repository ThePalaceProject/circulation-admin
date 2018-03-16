import { RequestError } from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import createRegisterLibraryReducer from "./createRegisterLibraryReducer";

export default createRegisterLibraryReducer(ActionCreator.REGISTER_LIBRARY_WITH_COLLECTION);
