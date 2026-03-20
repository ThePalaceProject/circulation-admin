// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";
import SelfTestsTabContainer from "../config/SelfTestsTabContainer";
import { withAppContext } from "../../utils/withAppContext";

export interface TroubleshootingCategoryPageState {
  tab: string;
}

export interface TroubleshootingCategoryPageProps {
  type: string;
  subtab?: string;
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

export class TroubleshootingCategoryPage extends React.Component<
  TroubleshootingCategoryPageProps,
  TroubleshootingCategoryPageState
> {
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
    const tabContainer = this.CATEGORIES[this.props.type][1];
    // Render tab navigation and content (no noContainer: true)
    return (
      <div className={`${this.props.type}-page`}>
        {React.createElement(tabContainer, {
          store: this.props.editorStore,
          csrfToken: this.props.csrfToken,
          tab: this.props.subtab || this.state.tab,
          goToTab: this.goToTab,
          className: undefined,
        })}
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }
}

export default withAppContext(TroubleshootingCategoryPage);
