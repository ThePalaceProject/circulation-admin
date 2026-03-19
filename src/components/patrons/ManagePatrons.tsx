import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { RootState } from "../../store";
import ManagePatronsForm from "./ManagePatronsForm";
import Header from "../layout/Header";
import ManagePatronsTabContainer from "./ManagePatronsTabContainer";

export interface ManagePatronsProps extends React.Props<ManagePatronsProps> {
  params: {
    library?: string;
    tab: string;
  };
}

export interface ManagePatronsContext {
  editorStore: Store<RootState>;
  csrfToken: string;
}

export class ManagePatrons extends React.Component<ManagePatronsProps> {
  context: ManagePatronsContext;

  static contextTypes: React.ValidationMap<ManagePatronsContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

  static childContextTypes: React.ValidationMap<{ library: () => string }> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
    };
  }

  render() {
    return (
      <div className="manage-patrons-page config">
        <Header />
        <main className="manage-patrons">
          <h1 className="page-title">Patron Manager</h1>
          <div className="tab-container vertical-tabs">
            <ManagePatronsTabContainer
              tab={this.props.params.tab}
              store={this.context.editorStore}
              csrfToken={this.context.csrfToken}
              library={this.props.params.library}
              className="vertical-tabs"
            />
          </div>
        </main>
      </div>
    );
  }
}

export default ManagePatrons;
