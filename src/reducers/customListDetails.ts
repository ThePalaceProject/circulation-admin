import { CollectionData } from "opds-web-client/lib/interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer, { FetchEditState } from "./createFetchEditReducer";

const loadRequest = (state, action) => {
  return Object.assign({}, state, {
    isLoaded: false,
    isFetchingMoreEntries: true,
  });
};

// Update the entries from a custom list.
const loadCB = (state, action) => {
  return Object.assign({}, state, {
    data: Object.assign({}, state.data, {
      books: Object.assign([], state.data.books).concat(action.data.books),
      nextPageUrl: action.data.nextPageUrl
    }),
    isFetchingMoreEntries: false,
    isLoaded: true,
  });
};

const extraActions = {
  [`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`]: loadRequest,
  [`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`]: loadCB,
};

export interface FetchMoreCustomListDetails<T> extends FetchEditState<T> {
  isFetchingMoreEntries: boolean;
}

export default createFetchEditReducer<CollectionData>(
  ActionCreator.CUSTOM_LIST_DETAILS,
  null,
  extraActions,
);
