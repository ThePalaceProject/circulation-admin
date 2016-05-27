import * as React from "react";
import Header from "./Header";
import CirculationEvents from "./CirculationEvents";

export interface DashboardContext {
  editorStore: Redux.Store;
}

export default class Dashboard extends React.Component<any, any> {
  context: DashboardContext;

  static contextTypes = {
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="dashboard">
        <Header />
        <div className="dashboardBody" style={{ margin: "10px", marginTop: "60px" }}>
          <CirculationEvents store={this.context.editorStore} />
        </div>
      </div>
    );
  }
}