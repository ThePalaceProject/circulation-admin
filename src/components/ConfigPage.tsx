import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import ConfigTabContainer from "./ConfigTabContainer";
import { RootState } from "../store";
import title from "../utils/title";

export interface ConfigPageProps extends React.Props<ConfigPageProps> {
  params: {
    tab: string;
    editOrCreate: string;
    identifier: string;
  };
}

export interface ConfigPageContext {
  editorStore: Store<RootState>;
  csrfToken: string;
}

/** System configuration page. Extracts parameters from its context
    and passes them to `ConfigTabContainer` as props. */
export default class ConfigPage extends React.Component<ConfigPageProps> {
  context: ConfigPageContext;

  static contextTypes: React.ValidationMap<ConfigPageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
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
            store={this.context.editorStore}
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
