import { CollectionsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<CollectionsData>(ActionCreator.COLLECTIONS, ActionCreator.EDIT_COLLECTION);
