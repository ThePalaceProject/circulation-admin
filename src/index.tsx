import * as React from "react";
import * as ReactDOM from "react-dom";
import buildStore from "./store";
import { Provider } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import { withParams } from "./utils/withNavigate";
import { ConfigurationSettings } from "./interfaces";
import { defaultFeatureFlags } from "./utils/featureFlags";

// Wrap class page components so they receive v6 route params as `this.props.params`
const CatalogPageRouted = withParams(CatalogPage as any) as any;
const CustomListPageRouted = withParams(CustomListPage as any) as any;
const LanePageRouted = withParams(LanePage as any) as any;
const DashboardPageRouted = withParams(DashboardPage as any) as any;
const QuicksightDashboardPageRouted = withParams(
  QuicksightDashboardPage as any
) as any;
const ConfigPageRouted = withParams(ConfigPage as any) as any;
const AccountPageRouted = withParams(AccountPage as any) as any;
const ManagePatronsRouted = withParams(ManagePatrons as any) as any;
const TroubleshootingPageRouted = withParams(TroubleshootingPage as any) as any;

/** Bridge component that lives inside BrowserRouter and passes navigate + location
    to ContextProvider so it can build the v3-compatible legacy `router` context shim. */
function RouterContextBridge({
  config,
  store,
  children,
}: {
  config: ConfigurationSettings;
  store: any;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <ContextProvider
      config={config}
      store={store}
      navigate={navigate}
      pathname={location.pathname}
    >
      {children as any}
    </ContextProvider>
  );
}

/** The main admin interface application. Create an instance of this class
    to render the app and set up routing. */
class CirculationAdmin {
  constructor(config: ConfigurationSettings) {
    const div = document.createElement("div");
    div.id = "opds-catalog";
    div.className = "palace";
    document.getElementsByTagName("body")[0].appendChild(div);
    document.documentElement.lang = "en";

    const quicksightPagePath = "/admin/web/quicksight";

    const queryClient = new QueryClient();

    const store = buildStore();

    config.featureFlags = { ...defaultFeatureFlags, ...config.featureFlags };
    config.quicksightPagePath = quicksightPagePath;

    const appElement = "opds-catalog";
    const app = config.settingUp ? (
      <Provider store={store}>
        <BrowserRouter>
          <RouterContextBridge config={config} store={store}>
            <SetupPage />
          </RouterContextBridge>
        </BrowserRouter>
      </Provider>
    ) : (
      <Provider store={store}>
        <BrowserRouter>
          <RouterContextBridge config={config} store={store}>
            <QueryClientProvider client={queryClient}>
              <Routes>
                {/* Catalog editor: all param combinations */}
                <Route
                  path="/admin/web/collection/:collectionUrl/book/:bookUrl/tab/:tab"
                  element={<CatalogPageRouted />}
                />
                <Route
                  path="/admin/web/collection/:collectionUrl/book/:bookUrl"
                  element={<CatalogPageRouted />}
                />
                <Route
                  path="/admin/web/collection/:collectionUrl/tab/:tab"
                  element={<CatalogPageRouted />}
                />
                <Route
                  path="/admin/web/collection/:collectionUrl"
                  element={<CatalogPageRouted />}
                />
                <Route path="/admin/web" element={<CatalogPageRouted />} />

                {/* Custom lists */}
                <Route
                  path="/admin/web/lists/:library/:editOrCreate/:identifier"
                  element={<CustomListPageRouted />}
                />
                <Route
                  path="/admin/web/lists/:library/:editOrCreate"
                  element={<CustomListPageRouted />}
                />
                <Route
                  path="/admin/web/lists/:library"
                  element={<CustomListPageRouted />}
                />
                <Route
                  path="/admin/web/lists"
                  element={<CustomListPageRouted />}
                />

                {/* Lanes */}
                <Route
                  path="/admin/web/lanes/:library/:editOrCreate/:identifier"
                  element={<LanePageRouted />}
                />
                <Route
                  path="/admin/web/lanes/:library/:editOrCreate"
                  element={<LanePageRouted />}
                />
                <Route
                  path="/admin/web/lanes/:library"
                  element={<LanePageRouted />}
                />
                <Route path="/admin/web/lanes" element={<LanePageRouted />} />

                {/* Dashboard */}
                <Route
                  path="/admin/web/dashboard/:library"
                  element={<DashboardPageRouted />}
                />
                <Route
                  path="/admin/web/dashboard"
                  element={<DashboardPageRouted />}
                />

                {/* Quicksight */}
                <Route
                  path={quicksightPagePath}
                  element={<QuicksightDashboardPageRouted />}
                />

                {/* Config */}
                <Route
                  path="/admin/web/config/:tab/:editOrCreate/:identifier"
                  element={<ConfigPageRouted />}
                />
                <Route
                  path="/admin/web/config/:tab/:editOrCreate"
                  element={<ConfigPageRouted />}
                />
                <Route
                  path="/admin/web/config/:tab"
                  element={<ConfigPageRouted />}
                />
                <Route
                  path="/admin/web/config"
                  element={<ConfigPageRouted />}
                />

                {/* Account */}
                <Route
                  path="/admin/web/account"
                  element={<AccountPageRouted />}
                />

                {/* Patrons */}
                <Route
                  path="/admin/web/patrons/:library/:tab"
                  element={<ManagePatronsRouted />}
                />
                <Route
                  path="/admin/web/patrons/:library"
                  element={<ManagePatronsRouted />}
                />

                {/* Troubleshooting */}
                <Route
                  path="/admin/web/troubleshooting/:tab/:subtab"
                  element={<TroubleshootingPageRouted />}
                />
                <Route
                  path="/admin/web/troubleshooting/:tab"
                  element={<TroubleshootingPageRouted />}
                />
                <Route
                  path="/admin/web/troubleshooting"
                  element={<TroubleshootingPageRouted />}
                />
              </Routes>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </RouterContextBridge>
        </BrowserRouter>
      </Provider>
    );

    // `react-axe` should only run in development and testing mode.
    // Running this is resource intensive and should only be used to test
    // for accessibility and not during active development.
    if (process.env.TEST_AXE === "true") {
      import("react-axe").then(({ default: axe }) => {
        axe(React, ReactDOM, 1000);
        ReactDOM.render(app, document.getElementById(appElement));
      });
    } else {
      ReactDOM.render(app, document.getElementById(appElement));
    }
  }
}

export = CirculationAdmin;
