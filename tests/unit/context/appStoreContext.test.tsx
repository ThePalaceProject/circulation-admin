import * as React from "react";
import { renderHook } from "@testing-library/react";
import { Provider, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import {
  AppReduxProvider,
  AppStoreProvider,
  useAppStore,
} from "../../../src/context/appStoreContext";
import buildStore from "../../../src/store";

describe("appStoreContext", () => {
  it("gives the store from AppStoreProvider", () => {
    const store = buildStore();
    const { result } = renderHook(() => useAppStore(), {
      wrapper: ({ children }) => (
        <AppStoreProvider value={store}>{children}</AppStoreProvider>
      ),
    });
    expect(result.current).toBe(store);
  });

  it("throws when there is no AppStoreProvider", () => {
    // React logs the error, and jsdom reports it as uncaught. Hide both.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const hide = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", hide);
    try {
      expect(() => renderHook(() => useAppStore())).toThrow(
        "useAppStore must be used within an AppStoreProvider."
      );
    } finally {
      window.removeEventListener("error", hide);
      vi.restoreAllMocks();
    }
  });

  it("gives our store to react-redux inside another store's Provider", () => {
    const store = buildStore();
    const otherStore = configureStore({ reducer: (state = {}) => state });
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => (
        <AppStoreProvider value={store}>
          <Provider store={otherStore}>
            <AppReduxProvider>{children}</AppReduxProvider>
          </Provider>
        </AppStoreProvider>
      ),
    });
    expect(result.current).toBe(store);
  });
});
