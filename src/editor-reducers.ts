import { combineReducers } from "redux";

const initialState = {
  url: null,
  data: null,
  isFetching: false,
  error: null
};

const book = (state = initialState, action) => {

  switch (action.type) {
    case "LOAD_BOOK":
      return Object.assign({}, state, {
        url: action.url,
        data: action.data,
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