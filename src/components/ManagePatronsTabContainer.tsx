import * as React from "react";
import { TabContainer, TabContainerProps } from "./TabContainer";
import Admin from "../models/Admin";
import { useAppAdmin } from "../context/appContext";
import { useLegacyRouter } from "./LegacyRouterBridge";
import DebugAuthentication from "./DebugAuthentication";
import ResetAdobeId from "./ResetAdobeId";

export interface ManagePatronsTabContainerProps extends TabContainerProps {
  csrfToken: string;
  library: string;
  tab: string;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. The default export provides it
    `admin` and `router`. */
export class ManagePatronsTabContainer extends TabContainer<
  ManagePatronsTabContainerProps & { admin: Admin }
> {
  tabs() {
    const isLibraryManager =
      this.props.library &&
      this.props.admin.isLibraryManager(this.props.library);
    const tabs = {};
    if (isLibraryManager) {
      tabs["resetAdobeId"] = (
        <ResetAdobeId
          csrfToken={this.props.csrfToken}
          library={this.props.library}
        />
      );
      tabs["debugAuthentication"] = (
        <DebugAuthentication
          library={this.props.library}
          csrfToken={this.props.csrfToken}
          active={this.currentTab() === "debugAuthentication"}
        />
      );
    }
    return tabs;
  }

  handleSelect(event) {
    const tab = event.target.dataset.tabkey;
    if (this.props.router) {
      this.props.router.push(`/admin/web/patrons/${this.props.library}/${tab}`);
    }
  }

  tabDisplayName(name) {
    const displayNames = {
      resetAdobeId: "Reset Adobe ID",
      debugAuthentication: "Debug Authentication",
    };
    return displayNames[name] || super.tabDisplayName(name);
  }

  defaultTab() {
    return "resetAdobeId";
  }
}

/** Provides `ManagePatronsTabContainer` the `admin` and `router` that it needs,
    read with hooks. */
const ManagePatronsTabContainerWithHooks = (
  props: Omit<ManagePatronsTabContainerProps, "router">
) => {
  const admin = useAppAdmin();
  const router = useLegacyRouter();
  return <ManagePatronsTabContainer {...props} admin={admin} router={router} />;
};

export default ManagePatronsTabContainerWithHooks;
