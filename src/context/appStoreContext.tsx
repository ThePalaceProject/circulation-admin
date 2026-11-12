import * as React from "react";
import { createContext, useContext } from "react";
import { Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { RootState } from "../store";

// Our Redux store, kept apart from react-redux's own context. Inside
// web-opds-client's catalog, react-redux's context holds the catalog's store.
const AppStoreContext = createContext<Store<RootState> | undefined>(undefined);

export const AppStoreProvider = AppStoreContext.Provider;

export const useAppStore = (): Store<RootState> => {
  const store = useContext(AppStoreContext);
  if (store === undefined) {
    throw new Error("useAppStore must be used within an AppStoreProvider.");
  }
  return store;
};

/** Gives its children our Redux store through react-redux. Wrap our connected
 *  components in it when web-opds-client renders them, such as the header and
 *  the book details in the catalog. */
export const AppReduxProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => <Provider store={useAppStore()}>{children}</Provider>;
