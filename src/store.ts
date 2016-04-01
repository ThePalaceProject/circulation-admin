import { createStore, combineReducers, applyMiddleware } from "redux";
import * as thunk from "redux-thunk";
import browserReducers from "opds-browser/lib/reducers/index";
import editorReducers from "./reducers/index";

let reducers = combineReducers({
  editor: editorReducers,
  browser: browserReducers
});

export default function buildStore(initialState?: any) {
  return createStore(
    reducers,
    initialState,
    applyMiddleware(thunk)
  );
}