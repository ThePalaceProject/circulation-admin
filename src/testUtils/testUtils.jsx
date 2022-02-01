import React from "react";
import { render } from "@testing-library/react";
import ContextProvider from "../components/ContextProvider";
import { TOSContextProvider } from "../components/TOSContext";
import { Router, Route } from "react-router";
import { createMemoryHistory } from "history";

const mockConfig = {
  csrfToken: "token",
  tos_link_href: "library.org",
  tos_link_text: "Terms of Service",
  showCircEventsDownload: true,
  settingUp: false,
  email: "test@nypl.org",
  roles: [{ role: "system" }],
};

const AllTheProviders = ({ children }) => {
  const history = createMemoryHistory();
  return (
    <ContextProvider {...mockConfig}>
      <TOSContextProvider
        value={[mockConfig.tos_link_text, mockConfig.tos_link_href]}
      >
        <Router history={history}>
          <Route path={"/"}>{children}</Route>
        </Router>
      </TOSContextProvider>
    </ContextProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
