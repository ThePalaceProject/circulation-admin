import * as React from "react";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";
import QuicksightDashboard from "./QuicksightDashboard";

export interface QuicksightDashboardPageProps {
  params: {
    library?: string;
  };
}

/** Page holds quicksight dashboards. */
export default class QuicksightDashboardPage extends React.Component<QuicksightDashboardPageProps> {
  static childContextTypes: React.ValidationMap<object> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
    };
  }

  render(): JSX.Element {
    return (
      <div className="quicksight-dashboard">
        <Header logoOnly={true} />
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
