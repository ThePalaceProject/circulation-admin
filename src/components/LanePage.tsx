import * as React from "react";
import { AppContext, AppContextType } from "../context/appContext";
import * as PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import Lanes from "./Lanes";

export interface LanePageProps {
  params: {
    library?: string;
    editOrCreate?: string;
    identifier?: string;
  };
}

export default class LanePage extends React.Component<LanePageProps> {
  static contextType = AppContext;
  declare context: AppContextType;

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
          csrfToken={this.context.csrfToken}
        />
        <Footer />
      </div>
    );
  }
}
