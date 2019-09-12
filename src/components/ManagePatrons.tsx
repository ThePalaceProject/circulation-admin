import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import ManagePatronsForm from "./ManagePatronsForm";
import Header from "./Header";
import Footer from "./Footer";
import ManagePatronsTabContainer from "./ManagePatronsTabContainer";

export interface ManagePatronsProps extends React.Props<ManagePatronsProps> {
  params: {
    library?: string;
    tab: string;
  };
}

export interface ManagePatronsContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export class ManagePatrons extends React.Component<ManagePatronsProps, {}> {
  context: ManagePatronsContext;

  static contextTypes: React.ValidationMap<ManagePatronsContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired,
  };

  static childContextTypes: React.ValidationMap<{library: () => string}> = {
    library: PropTypes.func
  };

  getChildContext() {
    return {
      library: () => this.props.params.library
    };
  }

  render() {
    return (
      <div className="manage-patrons-page config">
        <Header />
        <div className="manage-patrons">
          <h2>Patron Manager</h2>
          <ManagePatronsTabContainer
            tab={this.props.params.tab}
            store={this.context.editorStore}
            csrfToken={this.context.csrfToken}
            library={this.props.params.library}
          />
        </div>
        <Footer />
      </div>
    );
  }
}

export default ManagePatrons;
