import { CollectionsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CollectionsData>(
  ActionCreator.PATRON_LOOKUP,
  ActionCreator.EDIT_COLLECTION,
);
