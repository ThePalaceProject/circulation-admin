import { combineReducers } from "redux";

const initialState = {
  data: null,
  isFetching: false,
  error: null
};

const book = (state = initialState, action) => {

  switch (action.type) {
    case "LOAD_BOOK":
      return Object.assign({}, state, {
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