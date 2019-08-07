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

  CATEGORIES = {
    "diagnostics": ["coverage_provider", DiagnosticsTabContainer, "service-types"],
    "self-tests": ["collections", SelfTestsTabContainer, "self-test-types"]
  };

  constructor(props) {
    super(props);
    let defaultSubtab = this.CATEGORIES[this.props.type][0];
    this.state = { tab: this.props.subtab || defaultSubtab };
    this.goToTab = this.goToTab.bind(this);
  }

  render(): JSX.Element {
    let [tabContainer, className] = [this.CATEGORIES[this.props.type][1], this.CATEGORIES[this.props.type][2]];
    return(
      <div className={`${this.props.type}-page`}>
       {
         React.createElement(
           tabContainer,
           {
             class: className,
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
