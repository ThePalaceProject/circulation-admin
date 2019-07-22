import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import DiagnosticsPage from "./DiagnosticsPage";
import SelfTestsPage from "./SelfTestsPage";

export interface TroubleshootingTabContainerProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
}

export default class TroubleshootingTabContainer extends TabContainer<TroubleshootingTabContainerProps> {
  context: TabContainerContext;
  static contextTypes: React.ValidationMap<TabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired
  };

  tabs() {
    return {
      "diagnostics": <DiagnosticsPage />,
      "self-tests": <SelfTestsPage />
    };
  }

  handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    this.props.goToTab(tab);
  }
}
