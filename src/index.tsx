import * as React from "react";
import * as ReactDOM from "react-dom";
import buildStore from "./store";
import { Provider } from "react-redux";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/layout/ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CatalogPage from "./components/catalog/CatalogPage";
import CustomListPage from "./components/lists/CustomListPage";
import LanePage from "./components/lanes/LanePage";
import DashboardPage from "./components/dashboard/DashboardPage";
import QuicksightDashboardPage from "./components/dashboard/QuicksightDashboardPage";
import ConfigPage from "./components/config/ConfigPage";
import AccountPage from "./components/patrons/AccountPage";
import SetupPage from "./components/layout/SetupPage";
import ManagePatrons from "./components/patrons/ManagePatrons";
import TroubleshootingPage from "./components/diagnostics/TroubleshootingPage";
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

    const catalogEditorPath =
      "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";
    const customListPagePath =
      "/admin/web/lists(/:library)(/:editOrCreate)(/:identifier)";
    const lanePagePath =
      "/admin/web/lanes(/:library)(/:editOrCreate)(/:identifier)";
    const quicksightPagePath = "/admin/web/quicksight";

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
            <Router history={browserHistory}>
              <Route path={catalogEditorPath} component={CatalogPage} />
              <Route path={customListPagePath} component={CustomListPage} />
              <Route path={lanePagePath} component={LanePage} />
              <Route
                path="/admin/web/dashboard(/:library)"
                component={DashboardPage}
              />
              <Route
                path={quicksightPagePath}
                component={QuicksightDashboardPage}
              />
              <Route
                path="/admin/web/config(/:tab)(/:editOrCreate)(/:identifier)"
                component={ConfigPage}
              />
              <Route path="/admin/web/account" component={AccountPage} />
              <Route
                path="/admin/web/patrons/:library(/:tab)"
                component={ManagePatrons}
              />
              <Route
                path="/admin/web/troubleshooting(/:tab)(/:subtab)"
                component={TroubleshootingPage}
              />
            </Router>
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
        ReactDOM.render(app, document.getElementById(appElement));
      });
    } else {
      ReactDOM.render(app, document.getElementById(appElement));
    }
  }
}

export = CirculationAdmin;
