import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import Lanes from "./Lanes";
import { RootState } from "../store";

export interface LanePageProps extends React.Props<LanePageProps> {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
}

export interface LanePageContext {
  editorStore: Store<RootState>;
  csrfToken: string;
}

export default class LanePage extends React.Component<
  LanePageProps,
  LanePageContext
> {
  context: LanePageContext;

  static contextTypes: React.ValidationMap<LanePageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

  static childContextTypes: React.ValidationMap<any> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
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
        <Footer />
      </div>
    );
  }
}
