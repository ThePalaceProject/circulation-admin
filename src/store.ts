import { configureStore, Store } from "@reduxjs/toolkit";

// import { apiSlice } from "./features/admin/admin-api-slice";
import catalogReducers from "@thepalaceproject/web-opds-client/lib/reducers/index";
import { State as CatalogState } from "@thepalaceproject/web-opds-client/lib/state";
import bookEditorSlice from "./features/book/bookEditorSlice";
import editorReducers, { State as EditorState } from "./reducers/index";

export interface CombinedState {
  editor: EditorState;
  catalog: CatalogState;
}

type BuildStoreArgs = {
  initialState?: CombinedState;
  csrfToken?: string;
};

export type ThunkExtraArgument = {
  csrfToken: string;
};

/** Build a redux store with reducers specific to the admin interface
    as well as reducers from web-opds-client. */
export default function buildStore({
  initialState,
  csrfToken,
}: BuildStoreArgs = {}) {
  // console.log("buildStore", initialState, csrfToken);
  return configureStore({
    reducer: {
      editor: editorReducers,
      catalog: catalogReducers,
      bookEditor: bookEditorSlice,
      // [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { csrfToken: "...csrfToken-text-here..." },
        },
      }),   // .concat(apiSlice.middleware),
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== "production",
  });
}

export const store = buildStore();
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
