import * as React from "react";
import { PageContextProvider } from "../context/pageContext";
import { AppContext, AppContextType } from "../context/appContext";
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

  render() {
    return (
      <PageContextProvider value={{ library: this.props.params.library }}>
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
      </PageContextProvider>
    );
  }
}

export default ManagePatrons;
