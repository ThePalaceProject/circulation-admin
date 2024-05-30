import { configureStore, Store } from "@reduxjs/toolkit";

import catalogReducers from "@thepalaceproject/web-opds-client/lib/reducers/index";
import { State as CatalogState } from "@thepalaceproject/web-opds-client/lib/state";
import editorReducers, { State as EditorState } from "./reducers/index";

export interface RootState {
  editor: EditorState;
  catalog: CatalogState;
}

/** Build a redux store with reducers specific to the admin interface
    as well as reducers from web-opds-client. */
export default function buildStore(initialState?: RootState): Store<RootState> {
  return configureStore({
    reducer: {
      editor: editorReducers,
      catalog: catalogReducers,
    },
    preloadedState: initialState,
  });
}
