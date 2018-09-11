import { CustomListDetailsData } from "../interfaces";
import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";

const loadRequest = (state, action) => {
  return Object.assign({}, state, {
    isFetching: true,
    isLoaded: false,
  });
};

// Update the entries from a custom list.
const loadCB = (state, action) => {
  return Object.assign({}, state, {
    data: Object.assign({}, state.data, {
      books: Object.assign([], state.data.books).concat(action.data.books),
      nextPageUrl: action.data.nextPageUrl
    }),
    isFetching: false,
    isLoaded: true,
  });
};

const extraActions = {
  [`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`]: loadRequest,
  [`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`]: loadCB,
};

export default createFetchEditReducer<CustomListDetailsData>(
  ActionCreator.CUSTOM_LIST_DETAILS,
  null,
  extraActions,
);
