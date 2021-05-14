import * as React from "react";
import {
  DiagnosticsServiceData,
  DiagnosticsCollectionData,
  TimestampData,
} from "../interfaces";

import { TabContainer, TabContainerProps } from "./TabContainer";
import { Panel } from "library-simplified-reusable-components";
import Timestamp from "./Timestamp";
import ToolTip from "./ToolTip";

export interface DiagnosticsServiceTabsProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  content: DiagnosticsServiceData[];
}

export default class DiagnosticsServiceTabs extends TabContainer<
  DiagnosticsServiceTabsProps
> {
  handleSelect(event) {
    const tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
  }

  tabs() {
    const tabs = {};
    const serviceNames = Object.keys(this.props.content);
    serviceNames.forEach((serviceName) => {
      tabs[serviceName] = this.renderCollections(
        this.props.content[serviceName]
      );
    });
    return tabs;
  }

  tabDisplayName(name) {
    // Get a flattened array of all the timestamps associated with this service.
    const timestampArray = [].concat(
      ...Object.values(this.props.content[name])
    );
    const hasException = timestampArray.some((ts) => ts.exception);
    // If any of the timestamps has an exception, display a warning.
    // Otherwise, display the number of timestamps.
    const badge = hasException ? (
      <span className="badge danger">!</span>
    ) : (
      <ToolTip
        trigger={<span className="badge">{timestampArray.length}</span>}
        text="Total number of timestamps for this service"
      />
    );
    return (
      <section>
        <span className="service-name">{super.tabDisplayName(name)}</span>
        {badge}
      </section>
    );
  }

  renderCollections(collections: Array<DiagnosticsCollectionData>) {
    // If the collection has any timestamps with exceptions, it should
    // start out expanded.
    return Object.keys(collections).map((collectionName) => {
      const collectionToRender = collections[collectionName];
      return (
        <Panel
          id={`diagnostics-${collectionToRender[0].id}`}
          key={collectionName}
          headerText={collectionName}
          openByDefault={collectionToRender.some((ts) => ts.exception)}
          content={this.renderTimestamps(collectionToRender)}
        />
      );
    });
  }

  renderTimestamps(timestamps: Array<TimestampData>): JSX.Element {
    const tsList = timestamps.map((timestamp) => (
      <li className="timestamp-holder" key={timestamp.id}>
        <Timestamp timestamp={timestamp} />
      </li>
    ));
    return <ul className="timestamps">{tsList}</ul>;
  }
}
