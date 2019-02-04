import * as React from "react";
import { DiagnosticsServiceData, DiagnosticsCollectionData, TimestampData } from "../interfaces";
import Collapsible from "./Collapsible";
import DiagnosticsServiceTabs from "./DiagnosticsServiceTabs";
import Timestamp from "./Timestamp";

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
    let tab = this.props.services ? Object.keys(this.props.services)[0] : "";
    this.state = { tab };
    this.goToTab = this.goToTab.bind(this);
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

  renderServices(services: Array<DiagnosticsServiceData>): JSX.Element {
    if (!services) {
      return <p>no services</p>
    }
    let serviceTabContent = {};
    Object.keys(services).map(serviceName => {
      serviceTabContent[serviceName] = this.renderCollections(services[serviceName])
    });
    let serviceList =
      <DiagnosticsServiceTabs
        content={serviceTabContent}
        tab={this.state.tab}
        goToTab={this.goToTab}
      />

    return <div className="config services">{serviceList}</div>;
  }

  renderCollections(service: Array<DiagnosticsCollectionData>): JSX.Element {
    let collections = Object.keys(service).map(collectionName =>
      <li className="list-group-item">
        <Collapsible
          title={collectionName}
          openByDefault={true}
          collapsible={false}
          body={this.renderTimestamps(service[collectionName])}
        />
      </li>
    );
    return <ul className="list-group">{collections}</ul>;
  }

  renderTimestamps(collection: Array<TimestampData>): JSX.Element {
    let timestamps = collection.map(timestamp =>
      <Timestamp timestamp={timestamp} />
    );
    return <ul>{timestamps}</ul>;
  }

  render(): JSX.Element {
    return this.renderServices(this.props.services);
  }
}
