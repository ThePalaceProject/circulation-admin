import { combineReducers } from "redux";

const initialState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  editError: null
};

const book = (state = initialState, action) => {

  switch (action.type) {
    case "FETCH_BOOK_REQUEST":
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null
      });

    case "EDIT_BOOK_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        editError: null
      });

    case "LOAD_BOOK":
      return Object.assign({}, state, {
        url: action.url,
        data: action.data,
        isFetching: false,
        fetchError: null
      });

    case "FETCH_BOOK_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case "EDIT_BOOK_FAILURE":
      return Object.assign({}, state, {
        editError: action.error,
        isFetching: false
      });

    default:
      return state;
  }
};

const reducers = combineReducers({
  book
});

export default reducers;