import { createStore, combineReducers, applyMiddleware } from "redux";
import catalogReducers from "opds-web-client/lib/reducers/index";
import editorReducers from "./reducers/index";
const thunk = require("redux-thunk").default;

let reducers = combineReducers({
  editor: editorReducers,
  catalog: catalogReducers
});

export default function buildStore(initialState?: any) {
  return createStore(
    reducers,
    initialState,
    applyMiddleware(thunk)
  );
}