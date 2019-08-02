import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";

export interface DiagnosticsPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface DiagnosticsPageState {
  tab: string;
}

export interface DiagnosticsPageProps {
  subtab?: string;
}

export default class DiagnosticsPage extends React.Component<DiagnosticsPageProps, DiagnosticsPageState> {
  context: DiagnosticsPageContext;

  static contextTypes: React.ValidationMap<DiagnosticsPageContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { tab: this.props.subtab || "coverage_provider" };
    this.goToTab = this.goToTab.bind(this);
  }

  render(): JSX.Element {
    return(
      <div className="diagnostics-page">
        <DiagnosticsTabContainer
          class="service-types"
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          tab={this.props.subtab || this.state.tab }
          goToTab={this.goToTab}
        />
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

}
