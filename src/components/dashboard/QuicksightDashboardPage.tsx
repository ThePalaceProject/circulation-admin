// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore] as props, replacing legacy contextTypes.
// The library fn is provided via LibraryContext in step 6.
import * as React from "react";
import { RootState } from "../../store";
import Header from "../layout/Header";
import title from "../../utils/title";
import QuicksightDashboard from "./QuicksightDashboard";
import { withAppContext } from "../../utils/withAppContext";
import { LibraryContext } from "../../context/LibraryContext";

export interface QuicksightDashboardPageProps
  extends React.Props<QuicksightDashboardPageProps> {
  params: {
    library?: string;
  };
}

/** Page holds quicksight dashboards. */
export class QuicksightDashboardPage extends React.Component<
  QuicksightDashboardPageProps
> {
  render(): JSX.Element {
    const { library } = this.props.params;
    return (
      <LibraryContext.Provider value={() => library}>
        <div className="quicksight-dashboard">
          <Header logoOnly={true} />
          <main className="body">
            <QuicksightDashboard dashboardId="library" />
          </main>
        </div>
      </LibraryContext.Provider>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Quicksight Dashboard");
  }
}

export default withAppContext(QuicksightDashboardPage);
