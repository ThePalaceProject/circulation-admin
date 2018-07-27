import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import Lanes from "./Lanes";
import { State } from "../reducers/index";

export interface LanePageProps extends React.Props<LanePageProps> {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
}

export interface LanePageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export default class LanePage extends React.Component<LanePageProps, LanePageContext> {
  context: LanePageContext;

  static contextTypes: React.ValidationMap<LanePageContext> = {
    editorStore: React.PropTypes.object.isRequired,
    csrfToken: React.PropTypes.string.isRequired
  };

  static childContextTypes: React.ValidationMap<any> = {
    library: React.PropTypes.func
  };

  getChildContext() {
    return {
      library: () => this.props.params.library
    };
  }

  render(): JSX.Element {
    return (
      <div className="lane-page">
        <Header />
        <Lanes
          library={this.props.params.library}
          editOrCreate={this.props.params.editOrCreate}
          identifier={this.props.params.identifier}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}
          />
      </div>
    );
  }
}
