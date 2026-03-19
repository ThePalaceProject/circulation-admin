import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import { RootState } from "../../store";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";
import SelfTestsTabContainer from "../config/SelfTestsTabContainer";

export interface TroubleshootingCategoryPageContext {
  editorStore: Store<RootState>;
  csrfToken: string;
}

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
  context: TroubleshootingCategoryPageContext;

  static contextTypes: React.ValidationMap<
    TroubleshootingCategoryPageContext
  > = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

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
          store: this.context.editorStore,
          csrfToken: this.context.csrfToken,
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
