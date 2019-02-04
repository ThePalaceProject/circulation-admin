import * as React from "react";
import { DiagnosticsData } from "../interfaces";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";

export interface DiagnosticsServiceTabsProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  content: { [index: string]: JSX.Element };
}

export default class DiagnosticsServiceTabs extends TabContainer<DiagnosticsServiceTabsProps> {

  handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
  }

  tabs() {
    return this.props.content;
  }
}
