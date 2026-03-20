// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
import TroubleshootingCategoryPage from "./TroubleshootingCategoryPage";
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import Header from "../layout/Header";
import { RootState } from "../../store";
import TroubleshootingTabContainer from "./TroubleshootingTabContainer";
import title from "../../utils/title";
import { withAppContext } from "../../utils/withAppContext";

export interface TroubleshootingPageState {
  tab: string;
  subtab: string;
}

export interface TroubleshootingPageProps
  extends React.Props<TroubleshootingPageProps> {
  params: {
    tab?: string;
    subtab?: string;
  };
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

export class TroubleshootingPage extends React.Component<
  TroubleshootingPageProps,
  TroubleshootingPageState
> {
  CATEGORIES = {
    diagnostics: ["coverage_provider", "script", "monitor", "other"],
    "self-tests": ["collections", "patronAuthServices", "metadataServices"],
  };

  constructor(props) {
    super(props);
    this.state = { tab: "diagnostics", subtab: "coverage_provider" };
    this.goToTab = this.goToTab.bind(this);
  }

  UNSAFE_componentWillMount() {
    document.title = title("Troubleshooting");
  }

  render(): JSX.Element {
    const tab = this.props.params.tab || this.state.tab;
    let subtab = this.props.params.subtab || this.state.subtab;
    subtab =
      this.CATEGORIES[tab].indexOf(subtab) >= 0
        ? subtab
        : this.CATEGORIES[tab][0];
    return (
      <div className="troubleshooting-page">
        <Header />
        <div className="body">
          <div className="tab-container vertical-tabs">
            <div>
              <TroubleshootingTabContainer
                tab={tab}
                goToTab={this.goToTab}
                subtab={subtab}
              />
            </div>
            <div className="vertical-tabs-content">
              <h2>Troubleshooting</h2>
              <TroubleshootingCategoryPage type={tab} subtab={subtab} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab, subtab: this.props.params.subtab });
  }
}

export default withAppContext(TroubleshootingPage);
