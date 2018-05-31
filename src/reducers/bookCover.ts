import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

export default createFetchEditReducer<string>(ActionCreator.BOOK_COVER, ActionCreator.EDIT_BOOK_COVER);
