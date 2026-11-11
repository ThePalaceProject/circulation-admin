import * as React from "react";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import ConfigTabContainer from "./ConfigTabContainer";
import title from "../utils/title";

export interface ConfigPageProps {
  params: {
    tab: string;
    editOrCreate: string;
    identifier: string;
  };
}

export interface ConfigPageContext {
  csrfToken: string;
}

/** System configuration page. Extracts parameters from its context
    and passes them to `ConfigTabContainer` as props. */
export default class ConfigPage extends React.Component<ConfigPageProps> {
  context: ConfigPageContext;

  static contextTypes: React.ValidationMap<ConfigPageContext> = {
    csrfToken: PropTypes.string.isRequired,
  };

  render(): JSX.Element {
    return (
      <div className="config">
        <Header />
        <main>
          <ConfigTabContainer
            tab={this.props.params.tab}
            editOrCreate={this.props.params.editOrCreate}
            identifier={this.props.params.identifier}
            csrfToken={this.context.csrfToken}
            class="clearfix"
          />
        </main>
        <Footer />
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Configuration");
  }
}
