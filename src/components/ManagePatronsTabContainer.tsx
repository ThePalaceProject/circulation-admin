import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { RootState } from "../store";
import ActionCreator from "../actions";
import {
  TabContainer,
  TabContainerProps,
  TabContainerContext,
} from "./TabContainer";
import Admin from "../models/Admin";
import DebugAuthentication from "./DebugAuthentication";
import ResetAdobeId from "./ResetAdobeId";

export interface ManagePatronsTabContainerProps extends TabContainerProps {
  store: Store<RootState>;
  csrfToken: string;
  library: string;
  tab: string;
}

export interface ManagePatronsTabContainerContext extends TabContainerContext {
  admin: Admin;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. */
export default class ManagePatronsTabContainer extends TabContainer<
  ManagePatronsTabContainerProps
> {
  context: ManagePatronsTabContainerContext;
  static contextTypes: React.ValidationMap<ManagePatronsTabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
    admin: PropTypes.object.isRequired as React.Validator<Admin>,
  };

  tabs() {
    const isLibraryManager =
      this.props.library &&
      this.context.admin.isLibraryManager(this.props.library);
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
