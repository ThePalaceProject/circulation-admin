import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { RootState } from "../store";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import Stats from "./Stats";
import title from "../utils/title";
import CirculationEventsDownload from "./CirculationEventsDownload";

export interface DashboardPageProps extends React.Props<DashboardPageProps> {
  params: {
    library?: string;
  };
}

export interface DashboardPageContext {
  editorStore: Store<RootState>;
}

/** Page that shows high-level statistics about patrons and collections
    and a list of the most recent circulation events. */
export default class DashboardPage extends React.Component<DashboardPageProps> {
  context: DashboardPageContext;

  static contextTypes: React.ValidationMap<DashboardPageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
  };

  static childContextTypes: React.ValidationMap<object> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
    };
  }

  render(): JSX.Element {
    const { library } = this.props.params;
    return (
      <div className="dashboard">
        <Header />
        <main className="body">
          <Stats library={library} />
          <CirculationEventsDownload library={library} />
        </main>
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Dashboard");
  }
}
