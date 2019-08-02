import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import { State } from "../reducers/index";
import SelfTestsTabContainer from "./SelfTestsTabContainer";

export interface SelfTestsPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface SelfTestsPageState {
  tab: string;
}

export interface SelfTestsPageProps {
  subtab?: string;
}

export default class SelfTestsPage extends React.Component<SelfTestsPageProps, SelfTestsPageState> {
  context: SelfTestsPageContext;

  static contextTypes: React.ValidationMap<SelfTestsPageContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { tab: this.props.subtab || "collections" };
    this.goToTab = this.goToTab.bind(this);
  }

  render(): JSX.Element {
    return(
      <div className="self-tests-page">
        <SelfTestsTabContainer
          tab={this.props.subtab || this.state.tab}
          csrfToken={this.context.csrfToken}
          store={this.context.editorStore}
          goToTab={this.goToTab}
          class="self-test-types"
        />
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

}
