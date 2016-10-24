import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import Stats from "./Stats";
import CirculationEvents from "./CirculationEvents";
import { State } from "../reducers/index";

export interface DashboardContext {
  editorStore: Store<State>;
}

export default class Dashboard extends React.Component<any, any> {
  context: DashboardContext;

  static contextTypes: React.ValidationMap<DashboardContext> = {
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