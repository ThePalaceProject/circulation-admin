import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import Header from "./Header";
import { State } from "../reducers/index";
import TroubleshootingSidebar from "./TroubleshootingSidebar";


export interface TroubleshootingPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface TroubleshootingPageState {
  tab: string;
}

export default class TroubleshootingPage extends React.Component<{}, TroubleshootingPageState> {
  context: TroubleshootingPageContext;

  static contextTypes: React.ValidationMap<TroubleshootingPageContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { tab: "diagnostics" };
    this.goToTab = this.goToTab.bind(this);
  }

  componentWillMount() {
    document.title = "Circulation Manager - Troubleshooting";
  }

  render(): JSX.Element {
    return(
      <div className="troubleshooting-page">
        <Header />
        <div className="body">
          <h2>Troubleshooting</h2>
          <TroubleshootingSidebar
            store={this.context.editorStore}
            csrfToken={this.context.csrfToken}
            tab={this.state.tab}
            goToTab={this.goToTab}
          />
        </div>
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

}
