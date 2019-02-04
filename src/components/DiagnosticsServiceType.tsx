import * as React from "react";
import { DiagnosticsServiceData, DiagnosticsCollectionData, TimestampData } from "../interfaces";
import Collapsible from "./Collapsible";
import Timestamp from "./Timestamp";

export interface DiagnosticsServiceTypeProps {
  services: Array<DiagnosticsServiceData>;
  type: string;
}

export default class DiagnosticsServiceType extends React.Component<DiagnosticsServiceTypeProps, void> {

  renderServices(services: Array<DiagnosticsServiceData>): JSX.Element {
    let serviceList = services ?
      Object.keys(services).map(serviceName =>
        <li>
          <Collapsible
            title={serviceName}
            body={this.renderCollections(services[serviceName])}
            openByDefault={true}
            collapsible={false}
          />
        </li>
      ) :
      <p>no services</p>;

    return <ul className="services">{serviceList}</ul>;
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
