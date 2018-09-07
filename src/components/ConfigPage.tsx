import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import ConfigTabContainer from "./ConfigTabContainer";
import { State } from "../reducers/index";

export interface ConfigPageProps extends React.Props<ConfigPageProps> {
  params: {
    tab: string;
    editOrCreate: string;
    identifier: string;
  };
}

export interface ConfigPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

/** System configuration page. Extracts parameters from its context
    and passes them to `ConfigTabContainer` as props. */
export default class ConfigPage extends React.Component<ConfigPageProps, void> {
  context: ConfigPageContext;

  static contextTypes: React.ValidationMap<ConfigPageContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="config">
        <Header />
        <ConfigTabContainer
          tab={this.props.params.tab}
          editOrCreate={this.props.params.editOrCreate}
          identifier={this.props.params.identifier}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          />
      </div>
    );
  }

  componentWillMount() {
    document.title = "Circulation Manager - Configuration";
  }
}
