// HOC PATTERN: This component is wrapped with withAppContext() at export
// to inject [editorStore, csrfToken] as props, replacing legacy contextTypes.
import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import Header from "../layout/Header";
import ConfigTabContainer from "./ConfigTabContainer";
import { RootState } from "../../store";
import title from "../../utils/title";
import { withAppContext } from "../../utils/withAppContext";

export interface ConfigPageProps extends React.Props<ConfigPageProps> {
  params: {
    tab: string;
    editOrCreate: string;
    identifier: string;
  };
  editorStore?: Store<RootState>;
  csrfToken?: string;
}

/** System configuration page. Extracts parameters from its context
    and passes them to `ConfigTabContainer` as props. */
export class ConfigPage extends React.Component<ConfigPageProps> {
  render(): JSX.Element {
    return (
      <div className="config">
        <Header />
        <main>
          <ConfigTabContainer
            tab={this.props.params.tab}
            editOrCreate={this.props.params.editOrCreate}
            identifier={this.props.params.identifier}
            store={this.props.editorStore}
            csrfToken={this.props.csrfToken}
            className="vertical-tabs"
          />
        </main>
      </div>
    );
  }

  UNSAFE_componentWillMount() {
    document.title = title("Configuration");
  }
}

export default withAppContext(ConfigPage);
