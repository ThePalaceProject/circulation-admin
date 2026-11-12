import * as React from "react";
import { AppContext, AppContextType } from "../context/appContext";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";
import SelfTestsTabContainer from "./SelfTestsTabContainer";

export interface TroubleshootingCategoryPageState {
  tab: string;
}

export interface TroubleshootingCategoryPageProps {
  type: string;
  subtab?: string;
}

export default class TroubleshootingCategoryPage extends React.Component<
  TroubleshootingCategoryPageProps,
  TroubleshootingCategoryPageState
> {
  static contextType = AppContext;
  declare context: AppContextType;

  CATEGORIES = {
    diagnostics: [
      "coverage_provider",
      DiagnosticsTabContainer,
      "service-types",
    ],
    "self-tests": ["collections", SelfTestsTabContainer, "self-test-types"],
  };

  constructor(props) {
    super(props);
    const defaultSubtab = this.CATEGORIES[this.props.type][0];
    this.state = { tab: this.props.subtab || defaultSubtab };
    this.goToTab = this.goToTab.bind(this);
  }

  render(): JSX.Element {
    const [tabContainer, className] = [
      this.CATEGORIES[this.props.type][1],
      this.CATEGORIES[this.props.type][2],
    ];
    return (
      <div className={`${this.props.type}-page`}>
        {React.createElement(tabContainer, {
          class: className,
          csrfToken: this.context.csrfToken,
          tab: this.props.subtab || this.state.tab,
          goToTab: this.goToTab,
        })}
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }
}
