import * as React from "react";
import { Store } from "redux";
import Header from "./Header";
import Stats from "./Stats";
import CirculationEvents from "./CirculationEvents";
import { State } from "../reducers/index";

export interface DashboardPageProps extends React.Props<DashboardPageProps> {
  params: {
    library?: string;
  };
}

export interface DashboardPageContext {
  editorStore: Store<State>;
}

/** Page that shows high-level statistics about patrons and collections
    and a list of the most recent circulation events. */
export default class DashboardPage extends React.Component<DashboardPageProps, void> {
  context: DashboardPageContext;

  static contextTypes: React.ValidationMap<DashboardPageContext> = {
    editorStore: React.PropTypes.object.isRequired
  };

  static childContextTypes: React.ValidationMap<void> = {
    library: React.PropTypes.func
  };

  getChildContext() {
    return {
      library: () => this.props.params.library
    };
  }

  render(): JSX.Element {
    return (
      <div className="dashboard">
        <Header />
        <div className="body">
          <Stats store={this.context.editorStore} library={this.props.params.library}/>
          { !this.props.params.library &&
            <CirculationEvents store={this.context.editorStore} />
          }
        </div>
      </div>
    );
  }

  componentWillMount() {
    document.title = "Circulation Manager - Dashboard";
  }
}
