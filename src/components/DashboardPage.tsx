import * as React from "react";
import { PageContextProvider } from "../context/pageContext";
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
  render(): JSX.Element {
    const { library } = this.props.params;
    return (
      <PageContextProvider value={{ library }}>
        <div className="dashboard">
          <Header />
          <main className="body">
            <Stats library={library} />
            <CirculationEventsDownload library={library} />
          </main>
          <Footer />
        </div>
      </PageContextProvider>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Dashboard");
  }
}
