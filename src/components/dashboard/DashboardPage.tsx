// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore] as props, replacing legacy contextTypes.
// The library fn is provided via LibraryContext in step 6.
import * as React from "react";
import { RootState } from "../../store";
import Header from "../layout/Header";
import Stats from "./Stats";
import title from "../../utils/title";
import CirculationEventsDownload from "./CirculationEventsDownload";
import { withAppContext } from "../../utils/withAppContext";
import { LibraryContext } from "../../context/LibraryContext";

export interface DashboardPageProps extends React.Props<DashboardPageProps> {
  params: {
    library?: string;
  };
}

/** Page that shows high-level statistics about patrons and collections
    and a list of the most recent circulation events. */
export class DashboardPage extends React.Component<DashboardPageProps> {
  render(): JSX.Element {
    const { library } = this.props.params;
    return (
      <LibraryContext.Provider value={() => library}>
        <div className="dashboard">
          <Header />
          <main className="body">
            <Stats library={library} />
            <CirculationEventsDownload library={library} />
          </main>
        </div>
      </LibraryContext.Provider>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Dashboard");
  }
}

export default withAppContext(DashboardPage);
