import { PatronAuthServicesData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";
import { extraActions } from "./hasSelfTests";

export default createFetchEditReducer<PatronAuthServicesData>(
  ActionCreator.PATRON_AUTH_SERVICES,
  ActionCreator.EDIT_PATRON_AUTH_SERVICE,
  extraActions
);
