import * as React from "react";
import { DiagnosticsServiceData, DiagnosticsCollectionData, TimestampData } from "../interfaces";
import Panel from "react-bootstrap";

import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import Collapsible from "./Collapsible";
import Timestamp from "./Timestamp";

export interface DiagnosticsServiceTabsProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  content: DiagnosticsServiceData[];
}

export default class DiagnosticsServiceTabs extends TabContainer<DiagnosticsServiceTabsProps> {

  handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
  }

  tabs() {
    let tabs = {};
    let serviceNames = Object.keys(this.props.content);
    serviceNames.map((serviceName) => {
      tabs[serviceName] = this.renderCollections(this.props.content[serviceName]);
    });
    return tabs;
  }

  renderCollections(collections: Array<DiagnosticsCollectionData>): Array<Panel> {
    return Object.keys(collections).map((collectionName) =>
      <Collapsible
        title={collectionName}
        openByDefault={true}
        body={this.renderTimestamps(collections[collectionName])}
      />
    );
  }

  renderTimestamps(timestamps: Array<TimestampData>): JSX.Element {
    let tsList = timestamps.map(timestamp =>
      <li><Timestamp timestamp={timestamp} /></li>
    );
    return <ul>{tsList}</ul>;
  }
}
