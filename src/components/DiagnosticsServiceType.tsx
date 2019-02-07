import * as React from "react";
import { DiagnosticsServiceData } from "../interfaces";
import DiagnosticsServiceTabs from "./DiagnosticsServiceTabs";

export interface DiagnosticsServiceTypeProps {
  services: Array<DiagnosticsServiceData>;
  type: string;
}

export interface DiagnosticsServiceTypeState {
  tab: string;
}

export default class DiagnosticsServiceType extends React.Component<DiagnosticsServiceTypeProps, DiagnosticsServiceTypeState> {

  constructor(props) {
    super(props);
    // Start out with the first tab selected.
    let tab = this.props.services ? Object.keys(this.props.services)[0] : "";
    this.state = { tab };
    this.goToTab = this.goToTab.bind(this);
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

  render(): JSX.Element {
    let serviceTabs = this.props.services ?
      <DiagnosticsServiceTabs
        content={this.props.services}
        tab={this.state.tab}
        goToTab={this.goToTab}
      /> :
      <span>There are currently no {this.props.type.split("_").join(" ")} services.</span>;

    return <div className="config services">{serviceTabs}</div>;
  }
}
