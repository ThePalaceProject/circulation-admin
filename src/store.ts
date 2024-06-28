import { configureStore } from "@reduxjs/toolkit";

import catalogReducers from "@thepalaceproject/web-opds-client/lib/reducers/index";
import { State as CatalogState } from "@thepalaceproject/web-opds-client/lib/state";
import bookEditorSlice from "./features/book/bookEditorSlice";
import editorReducers, { State as EditorState } from "./reducers/index";

export interface CombinedState {
  editor: EditorState;
  catalog: CatalogState;
}

/** Build a redux store with reducers specific to the admin interface
    as well as reducers from web-opds-client. */
export default function buildStore(initialState?: CombinedState) {
  return configureStore({
    reducer: {
      editor: editorReducers,
      catalog: catalogReducers,
      bookEditor: bookEditorSlice,
    },
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== "production",
  });
}

export const store = buildStore();
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
