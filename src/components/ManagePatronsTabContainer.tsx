import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import Admin from "../models/Admin";
import ResetAdobeId from "./ResetAdobeId";

export interface ManagePatronsTabContainerProps extends TabContainerProps {
  store: Store<State>;
  csrfToken: string;
  library: string;
  tab: string;
}

export interface ManagePatronsTabContainerContext extends TabContainerContext {
  admin: Admin;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. */
export default class ManagePatronsTabContainer extends TabContainer<ManagePatronsTabContainerProps> {
  context: ManagePatronsTabContainerContext;
  static contextTypes: React.ValidationMap<ManagePatronsTabContainerContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  tabs() {
    let isLibraryManager = this.props.library && this.context.admin.isLibraryManager(this.props.library);
    const tabs = {};
    if (isLibraryManager) {
      tabs["resetAdobeId"] = (
        <ResetAdobeId
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          library={this.props.library}
        />
      );
    }
    return tabs;
  }

  handleSelect(event) {
    let tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push("/admin/web/patrons/" + this.props.library + "/" + tab);
    }
  }

  // For now, we only have one item (reset Adobe ID) in this list of tabs.
  // We disable it to make clear to users that clicking on it isn't
  // supposed to do anything (they're already at the reset Adobe ID url, so
  // clicking on the link for it won't accomplish anything).  If/when we
  // have more items, we won't need to do this.
  tabClass(name) {
    return this.currentTab() === name ? "disabled" : null;
  }

  tabDisplayName(name) {
    if (name === "resetAdobeId") {
      return "Reset Adobe ID";
    } else {
      return super.tabDisplayName(name);
    }
  }

  defaultTab() {
    return "resetAdobeId";
  }
}
