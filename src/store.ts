import {
  compose,
  createStore,
  combineReducers,
  applyMiddleware,
  Store,
  Reducer,
} from "redux";
import catalogReducers from "@thepalaceproject/web-opds-client/lib/reducers/index";
import editorReducers, { State } from "./reducers/index";

const thunk = require("redux-thunk").default;

const reducers: Reducer = combineReducers({
  editor: editorReducers,
  catalog: catalogReducers,
});

const composeEnhancers =
  window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

/** Build a redux store with reducers specific to the admin interface
    as well as reducers from web-opds-client. */
export default function buildStore(initialState?: State): Store<State> {
  return createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(thunk))
  );
}
