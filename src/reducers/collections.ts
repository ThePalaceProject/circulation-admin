import { CollectionsData } from "../interfaces";
import { extraActions } from "./hasSelfTests";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CollectionsData>(
  ActionCreator.COLLECTIONS,
  ActionCreator.EDIT_COLLECTION,
  extraActions
);
