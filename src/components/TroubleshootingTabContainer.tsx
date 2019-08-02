import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import { TabContainer, TabContainerProps, TabContainerContext } from "./TabContainer";
import DiagnosticsPage from "./DiagnosticsPage";
import SelfTestsPage from "./SelfTestsPage";

export interface TroubleshootingTabContainerProps extends TabContainerProps {
  goToTab: (tabName: string) => void;
  subtab?: string;
}

export default class TroubleshootingTabContainer extends TabContainer<TroubleshootingTabContainerProps> {
  context: TabContainerContext;
  static contextTypes: React.ValidationMap<TabContainerContext> = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired
  };

  tabs() {
    return {
      "diagnostics": <DiagnosticsPage subtab={this.props.tab === "diagnostics" ? this.props.subtab : "coverage_provider"} />,
      "self-tests": <SelfTestsPage subtab={this.props.tab === "self-tests" ? this.props.subtab : "collections"} />
    };
  }

  componentWillReceiveProps(newProps: TroubleshootingTabContainerProps) {
    (newProps.tab !== this.props.tab) && this.route(newProps.tab, newProps.subtab);
  }

  handleSelect(event) {
    let tab = event.currentTarget.dataset.tabkey;
    let subtab = this.props.subtab;
    this.props.goToTab(tab);
    this.route(tab, subtab);

  }

  route(tab: string, subtab: string) {
    if (this.context.router) {
      this.context.router.push("/admin/web/troubleshooting/" + tab + "/" + subtab);
    }
  }
}
