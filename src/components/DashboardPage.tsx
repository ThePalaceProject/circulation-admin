import * as React from "react";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import Stats from "./Stats";
import title from "../utils/title";
import CirculationEventsDownload from "./CirculationEventsDownload";

export interface DashboardPageProps {
  params: {
    library?: string;
  };
}

/** Page that shows high-level statistics about patrons and collections
    and a list of the most recent circulation events. */
export default class DashboardPage extends React.Component<DashboardPageProps> {
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
