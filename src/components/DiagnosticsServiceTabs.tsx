import * as React from "react";
import { DiagnosticsServiceData, DiagnosticsCollectionData, TimestampData } from "../interfaces";

import { TabContainer, TabContainerProps } from "./TabContainer";
import { Panel } from "library-simplified-reusable-components";
import Timestamp from "./Timestamp";
import ToolTip from "./ToolTip";

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
    serviceNames.forEach((serviceName) => {
        tabs[serviceName] = this.renderCollections(this.props.content[serviceName]);
    });
    return tabs;
  }

  tabDisplayName(name) {
    // Get a flattened array of all the timestamps associated with this service.
    let timestampArray = [].concat(...Object.values(this.props.content[name]));
    let hasException = timestampArray.some((ts) => ts.exception);
    // If any of the timestamps has an exception, display a warning.  Otherwise, display the number of timestamps.
    let badge = hasException ?
        <span className="badge danger">!</span> :
        <ToolTip
          trigger={<span className="badge">{timestampArray.length}</span>}
          text="Total number of timestamps for this service"
        />;

    return <section><span className="service-name">{super.tabDisplayName(name)}</span>{badge}</section>;
  }

  renderCollections(collections: Array<DiagnosticsCollectionData>) {
    // If the collection has any timestamps with exceptions, it should start out expanded.
    return Object.keys(collections).map((collectionName, idx) =>
      <Panel
        key={collectionName}
        headerText={collectionName}
        openByDefault={collections[collectionName].some((ts) => ts.exception)}
        content={this.renderTimestamps(collections[collectionName])}
      />
    );
  }

  renderTimestamps(timestamps: Array<TimestampData>): JSX.Element {
    let tsList = timestamps.map(timestamp =>
      <li className="timestamp-holder" key={timestamp.toString()}>
        <Timestamp timestamp={timestamp} />
      </li>
    );
    return <ul className="timestamps">{tsList}</ul>;
  }
}
