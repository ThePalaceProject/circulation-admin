import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import buildStore from "./store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import ContextProvider from "./components/ContextProvider";
import AppRoutes, { quicksightPagePath } from "./components/AppRoutes";
import LegacyRouterBridge from "./components/LegacyRouterBridge";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SetupPage from "./components/SetupPage";
import { ConfigurationSettings } from "./interfaces";
import { defaultFeatureFlags } from "./utils/featureFlags";

/** The main admin interface application. Create an instance of this class
    to render the app and set up routing. */
class CirculationAdmin {
  constructor(config: ConfigurationSettings) {
    const div = document.createElement("div");
    div.id = "opds-catalog";
    div.className = "palace";
    document.getElementsByTagName("body")[0].appendChild(div);
    document.documentElement.lang = "en";

    const queryClient = new QueryClient();

    const store = buildStore();

    config.featureFlags = { ...defaultFeatureFlags, ...config.featureFlags };
    config.quicksightPagePath = quicksightPagePath;

    const appElement = "opds-catalog";
    const app = config.settingUp ? (
      <Provider store={store}>
        <ContextProvider config={config} store={store}>
          <SetupPage />
        </ContextProvider>
      </Provider>
    ) : (
      <Provider store={store}>
        <ContextProvider config={config} store={store}>
          <QueryClientProvider client={queryClient}>
            {/* Update on navigation at once, as react-router v3 did, instead of
                in a React transition. Our class components (with their
                UNSAFE_componentWillReceiveProps) expect that. */}
            <BrowserRouter useTransitions={false}>
              <LegacyRouterBridge>
                <AppRoutes />
              </LegacyRouterBridge>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ContextProvider>
      </Provider>
    );

    // `react-axe` should only run in development and testing mode.
    // Running this is resource intensive and should only be used to test
    // for accessibility and not during active development.
    if (process.env.TEST_AXE === "true") {
      import("react-axe").then((axe) => {
        axe(React, ReactDOM, 1000);
        createRoot(document.getElementById(appElement)).render(app);
      });
    } else {
      createRoot(document.getElementById(appElement)).render(app);
    }
  }
}

export = CirculationAdmin;
