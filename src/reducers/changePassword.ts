import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<void>(ActionCreator.CHANGE_PASSWORD);