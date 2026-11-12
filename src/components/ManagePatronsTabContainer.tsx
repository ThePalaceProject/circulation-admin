import * as React from "react";
import { TabContainer, TabContainerProps } from "./TabContainer";
import Admin from "../models/Admin";
import { useAppAdmin } from "../context/appContext";
import DebugAuthentication from "./DebugAuthentication";
import ResetAdobeId from "./ResetAdobeId";

export interface ManagePatronsTabContainerProps extends TabContainerProps {
  csrfToken: string;
  library: string;
  tab: string;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. The default export gives it
    `admin`. */
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
    if (this.context.router) {
      this.context.router.push(
        `/admin/web/patrons/${this.props.library}/${tab}`
      );
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

// `ManagePatronsTabContainer` reads `router` from legacy context, so it cannot
// also use `static contextType`. This wrapper reads `admin` with a hook instead.
const ManagePatronsTabContainerWithAdmin = (
  props: ManagePatronsTabContainerProps
) => {
  const admin = useAppAdmin();
  return <ManagePatronsTabContainer {...props} admin={admin} />;
};

export default ManagePatronsTabContainerWithAdmin;
