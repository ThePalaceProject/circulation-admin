import * as React from "react";
import { AppContext, AppContextType } from "../context/appContext";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import ManagePatronsTabContainer from "./ManagePatronsTabContainer";

export interface ManagePatronsProps {
  params: {
    library?: string;
    tab: string;
  };
}

export class ManagePatrons extends React.Component<ManagePatronsProps> {
  static contextType = AppContext;
  declare context: AppContextType;

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
          <h2>Patron Manager</h2>
          <ManagePatronsTabContainer
            tab={this.props.params.tab}
            csrfToken={this.context.csrfToken}
            library={this.props.params.library}
          />
        </main>
        <Footer />
      </div>
    );
  }
}

export default ManagePatrons;
