import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  TabContainer,
  TabContainerProps,
} from "../shared/TabContainer";
import Admin from "../../models/Admin";
import DebugAuthentication from "./DebugAuthentication";
import ResetAdobeId from "./ResetAdobeId";
import { withAppContext } from "../../utils/withAppContext";
import { withRoutingContext } from "../../utils/withRoutingContext";

export interface ManagePatronsTabContainerProps extends TabContainerProps {
  store: Store<RootState>;
  csrfToken: string;
  library: string;
  tab: string;
  admin?: Admin;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. */
export class ManagePatronsTabContainer extends TabContainer<
  ManagePatronsTabContainerProps
> {
  // HOC PATTERN: `admin` is injected via withAppContext at export,
  // replacing legacy contextTypes: { admin }.

  tabs() {
    const isLibraryManager =
      this.props.library &&
      this.props.admin?.isLibraryManager(this.props.library);
    const tabs = {};
    if (isLibraryManager) {
      tabs["resetAdobeId"] = (
        <ResetAdobeId
          store={this.props.store}
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
      this.props.router.push(
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

export default withRoutingContext(withAppContext(ManagePatronsTabContainer));
