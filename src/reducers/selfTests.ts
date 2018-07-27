import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<void>(ActionCreator.GET_SELF_TESTS, ActionCreator.RUN_SELF_TESTS);
