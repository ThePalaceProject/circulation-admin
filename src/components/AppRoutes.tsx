import * as React from "react";
import { Route, Routes, useLocation, useParams } from "react-router";
import CatalogPage from "./CatalogPage";
import CustomListPage from "./CustomListPage";
import LanePage from "./LanePage";
import DashboardPage from "./DashboardPage";
import QuicksightDashboardPage from "./QuicksightDashboardPage";
import ConfigPage from "./ConfigPage";
import AccountPage from "./AccountPage";
import ManagePatrons from "./ManagePatrons";
import TroubleshootingPage from "./TroubleshootingPage";

export const quicksightPagePath = "/admin/web/quicksight";

// React Router 7 has no optional group like v3's `(/collection/:collectionUrl)`,
// so list each form of `/admin/web(/collection/:c)(/book/:b)(/tab/:t)`.
const catalogEditorPaths = ["", "/collection/:collectionUrl"].flatMap(
  (collection) =>
    ["", "/book/:bookUrl"].flatMap((book) =>
      ["", "/tab/:tab"].map((tab) => `/admin/web${collection}${book}${tab}`)
    )
);

/** The admin interface pages, by path. Render inside a React Router router. */
const AppRoutes = () => (
  <Routes>
    {catalogEditorPaths.map((path) => (
      <Route key={path} path={path} element={routed(CatalogPage)} />
    ))}
    <Route
      path="/admin/web/lists/:library?/:editOrCreate?/:identifier?"
      element={routed(CustomListPage)}
    />
    <Route
      path="/admin/web/lanes/:library?/:editOrCreate?/:identifier?"
      element={routed(LanePage)}
    />
    <Route
      path="/admin/web/dashboard/:library?"
      element={routed(DashboardPage)}
    />
    <Route
      path={quicksightPagePath}
      element={routed(QuicksightDashboardPage)}
    />
    <Route
      path="/admin/web/config/:tab?/:editOrCreate?/:identifier?"
      element={routed(ConfigPage)}
    />
    <Route path="/admin/web/account" element={routed(AccountPage)} />
    <Route
      path="/admin/web/patrons/:library/:tab?"
      element={routed(ManagePatrons)}
    />
    <Route
      path="/admin/web/troubleshooting/:tab?/:subtab?"
      element={routed(TroubleshootingPage)}
    />
  </Routes>
);

export default AppRoutes;

/** Our pages still take the `params` and `location` props that react-router v3
 *  gave a route component, so pass them from the React Router 7 hooks. */
const RoutedPage = ({
  page: Page,
}: {
  page: React.ComponentType<{ params: any; location: any }>;
}) => {
  const params = useParams();
  const location = useLocation();
  return <Page params={params} location={location} />;
};

const routed = (page: React.ComponentType<any>) => <RoutedPage page={page} />;
