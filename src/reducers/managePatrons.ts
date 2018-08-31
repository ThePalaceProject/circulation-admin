import ActionCreator from "../actions";
import createFetchEditReducer from "./createFetchEditReducer";
import { PatronData } from "../interfaces";

// This is to "reset" the store's state of the current error or patron data,
// so that if an admin switches libraries or goes to a different page and
// returns, the previous error or patron information state won't be stored.
const loadCB = (state, action) => {
  return Object.assign({}, state, {
    data: null,
    fetchError: null,
    isFetching: false,
    isLoaded: true,
  });
};

const extraActions = {
  [`${ActionCreator.CLEAR_PATRON_DATA}_${ActionCreator.LOAD}`]: loadCB,
};

export default createFetchEditReducer<PatronData>(
  ActionCreator.PATRON_LOOKUP,
  ActionCreator.RESET_ADOBE_ID,
  extraActions,
);
