import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<void>(
  ActionCreator.PATRON_LOOKUP,
  ActionCreator.RESET_ADOBE_ID,
);
