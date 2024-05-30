import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { RootState } from "../store";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";
import QuicksightDashboard from "./QuicksightDashboard";

export interface QuicksightDashboardPageProps
  extends React.Props<QuicksightDashboardPageProps> {
  params: {
    library?: string;
  };
}

export interface QuicksightDashboardPageContext {
  editorStore: Store<RootState>;
}

/** Page holds quicksight dashboards. */
export default class QuicksightDashboardPage extends React.Component<
  QuicksightDashboardPageProps
> {
  context: QuicksightDashboardPageContext;

  static contextTypes: React.ValidationMap<QuicksightDashboardPageContext> = {
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
      <div className="quicksight-dashboard">
        <Header />
        <main className="body">
          <QuicksightDashboard dashboardId="library" />
        </main>
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Quicksight Dashboard");
  }
}
