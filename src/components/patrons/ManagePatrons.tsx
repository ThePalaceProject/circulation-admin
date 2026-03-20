// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
// The library fn is provided via LibraryContext in step 6.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { RootState } from "../../store";
import ManagePatronsForm from "./ManagePatronsForm";
import Header from "../layout/Header";
import ManagePatronsTabContainer from "./ManagePatronsTabContainer";
import { withAppContext } from "../../utils/withAppContext";
import { LibraryContext } from "../../context/LibraryContext";

export interface ManagePatronsProps extends React.Props<ManagePatronsProps> {
  params: {
    library?: string;
    tab: string;
  };
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

export class ManagePatrons extends React.Component<ManagePatronsProps> {
  render() {
    return (
      <LibraryContext.Provider value={() => this.props.params.library}>
        <div className="manage-patrons-page config">
          <Header />
          <main className="manage-patrons">
            <h1 className="page-title">Patron Manager</h1>
            <div className="tab-container vertical-tabs">
              <ManagePatronsTabContainer
                tab={this.props.params.tab}
                store={this.props.editorStore}
                csrfToken={this.props.csrfToken}
                library={this.props.params.library}
                className="vertical-tabs"
              />
            </div>
          </main>
        </div>
      </LibraryContext.Provider>
    );
  }
}

export default withAppContext(ManagePatrons);
