import * as React from "react";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import TroubleshootingTabContainer from "./TroubleshootingTabContainer";
import title from "../utils/title";

export interface TroubleshootingPageContext {
  csrfToken: string;
}

export interface TroubleshootingPageState {
  tab: string;
  subtab: string;
}

export interface TroubleshootingPageProps {
  params: {
    tab?: string;
    subtab?: string;
  };
}

export default class TroubleshootingPage extends React.Component<
  TroubleshootingPageProps,
  TroubleshootingPageState
> {
  context: TroubleshootingPageContext;

  static contextTypes: React.ValidationMap<TroubleshootingPageContext> = {
    csrfToken: PropTypes.string.isRequired,
  };

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
          <h2>Troubleshooting</h2>
          <TroubleshootingTabContainer
            csrfToken={this.context.csrfToken}
            tab={tab}
            goToTab={this.goToTab}
            subtab={subtab}
          />
        </div>
        <Footer />
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab, subtab: this.props.params.subtab });
  }
}
