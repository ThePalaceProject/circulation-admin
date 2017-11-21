import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import Stats from "./Stats";
import CirculationEvents from "./CirculationEvents";
import { State } from "../reducers/index";

export interface DashboardPageContext {
  editorStore: Store<State>;
}

/** Page that shows high-level statistics about patrons and collections
    and a list of the most recent circulation events.
    This currently shows information for the entire circulation
    manager, but probably should be updated to be per-library. */
export default class DashboardPage extends React.Component<void, void> {
  context: DashboardPageContext;

  static contextTypes: React.ValidationMap<DashboardPageContext> = {
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="dashboard">
        <Header />
        <div className="body">
          <Stats store={this.context.editorStore} />
          <CirculationEvents store={this.context.editorStore} />
        </div>
      </div>
    );
  }

  componentWillMount() {
    document.title = "Circulation Manager - Dashboard";
  }
}