import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";
import SelfTestsTabContainer from "./SelfTestsTabContainer";

export interface TroubleshootingCategoryPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface TroubleshootingCategoryPageState {
  tab: string;
}

export interface TroubleshootingCategoryPageProps {
  type: string;
  subtab?: string;
}

export default class TroubleshootingCategoryPage extends React.Component<TroubleshootingCategoryPageProps, TroubleshootingCategoryPageState> {
  context: TroubleshootingCategoryPageContext;

  static contextTypes: React.ValidationMap<TroubleshootingCategoryPageContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    let defaultSubtab = this.props.type === "diagnostics" ? "coverage_provider" : "collections";
    this.state = { tab: this.props.subtab || defaultSubtab };
    this.goToTab = this.goToTab.bind(this);
  }

  render(): JSX.Element {
    let tabContainer = this.props.type === "diagnostics" ? DiagnosticsTabContainer : SelfTestsTabContainer;
    return(
      <div className={`${this.props.type}-page`}>
       {
         React.createElement(
           tabContainer,
           {
             class: this.props.type === "diagnostics" ? "service-types" : "self-test-types",
             store: this.context.editorStore,
             csrfToken: this.context.csrfToken,
             tab: this.props.subtab || this.state.tab,
             goToTab: this.goToTab
           }
         )
       }
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

}
