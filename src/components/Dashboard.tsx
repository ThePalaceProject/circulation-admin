import * as React from "react";
import Header from "./Header";
import CirculationEvents from "./CirculationEvents";

export default class Dashboard extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="dashboard">
        <Header />
        <div className="dashboardBody" style={{ margin: "10px", marginTop: "60px" }}>
          <CirculationEvents />
        </div>
      </div>
    );
  }
}