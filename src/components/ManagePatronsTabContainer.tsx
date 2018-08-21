import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import Admin from "../models/Admin";
import ResetAdobeId from "./ResetAdobeId";
import { PatronData } from "../interfaces";

export interface ManagePatronsTabContainerStateProps {
  patron?: PatronData;
  isFetching?: boolean;
}
export interface PatronResponse {
  text: PatronData;
  response: IResponse;
}

export interface ManagePatronsTabContainerDispatchProps {
  patronLookup?: (data: FormData) => Promise<PatronResponse>;
}

export interface ManagePatronsTabContainerOwnProps {
  store: Store<State>;
  csrfToken: string;
  library: string;
  tab: string;
}

export interface ManagePatronsTabContainerProps extends
  TabContainerProps,
  ManagePatronsTabContainerStateProps,
  ManagePatronsTabContainerDispatchProps,
  ManagePatronsTabContainerOwnProps {}

export interface ManagePatronsTabContainerContext extends TabContainerContext {
  admin: Admin;
}

/** Body of the Patron Manager page, with a tab for each type of
    action that can be performed on a patron. */
export class ManagePatronsTabContainer extends TabContainer<ManagePatronsTabContainerProps> {
  context: ManagePatronsTabContainerContext;
  static contextTypes: React.ValidationMap<ManagePatronsTabContainerContext> = {
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  tabs() {
    const tabs = {};
    if (this.context.admin.isSystemAdmin()) {
      tabs["resetAdobeId"] = (
        <ResetAdobeId
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          patron={this.props.patron}
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

function mapStateToProps(state, ownProps) {
  const patron = state.editor.patronManager && state.editor.patronManager.data;
  return {
    patron: JSON.parse(patron),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData) => dispatch(actions.patronLookup(data)),
  };
}

const ConnectedManagePatronsTabContainer = connect<ManagePatronsTabContainerStateProps, ManagePatronsTabContainerDispatchProps, ManagePatronsTabContainerOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatronsTabContainer);

export default ConnectedManagePatronsTabContainer;
