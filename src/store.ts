import {
  compose,
  createStore,
  combineReducers,
  applyMiddleware,
  Store,
  Reducer,
} from "redux";
import catalogReducers from "@thepalaceproject/web-opds-client/lib/reducers";
import { State as CatalogState } from "@thepalaceproject/web-opds-client/lib/state";
import editorReducers, { State as EditorState } from "./reducers/index";

import thunk from "redux-thunk";

export interface RootState {
  editor: EditorState;
  catalog: CatalogState;
}

export const reducers: Reducer = combineReducers({
  editor: editorReducers,
  catalog: catalogReducers,
});

const composeEnhancers =
  window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

/** Build a redux store with reducers specific to the admin interface
    as well as reducers from web-opds-client. */
export default function buildStore(initialState?: RootState): Store<RootState> {
  return createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(thunk))
  );
}
