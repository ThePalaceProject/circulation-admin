import React from "react";
import { render } from "@testing-library/react";
import ContextProvider from "../components/ContextProvider";
import { TOSContextProvider } from "../components/TOSContext";

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
  return (
    <ContextProvider {...mockConfig}>
      <TOSContextProvider
        value={[mockConfig.tos_link_text, mockConfig.tos_link_href]}
      >
        {children}
      </TOSContextProvider>
    </ContextProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
