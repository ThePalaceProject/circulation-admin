import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";
import { ServiceData } from "../interfaces";

export default createFetchEditReducer<ServiceData>(
  ActionCreator.RUN_SELF_TESTS,
  ActionCreator.GET_SELF_TESTS,
);
