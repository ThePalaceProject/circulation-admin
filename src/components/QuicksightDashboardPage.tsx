import * as React from "react";
import Header from "./Header";
import Footer from "./Footer";
import title from "../utils/title";
import QuicksightDashboard from "./QuicksightDashboard";

/** Page holds quicksight dashboards. */
export default class QuicksightDashboardPage extends React.Component<object> {
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
