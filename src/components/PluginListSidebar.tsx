import * as React from "react";
import { PluginData, PluginListData, LibraryData } from "../interfaces";
import { Store } from "redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import { connect } from "react-redux";

export interface PluginListsSidebarProps {
  store?: Store<State>;
  activePlugin: PluginData;
  library: LibraryData;
  plugins: PluginData[];
  fetchPlugins: () => Promise<PluginListData>;
}

export interface PluginListsSidebarState {
  fetched: boolean;
}

export class PluginListsSidebar extends React.Component<
  PluginListsSidebarProps,
  PluginListsSidebarState
> {
  activePluginName: string;

  constructor(props) {
    super(props);
    this.activePluginName =
      this.props.activePlugin && this.props.activePlugin.name
        ? this.props.activePlugin.name
        : "";
    this.state = {
      fetched: false,
    };
  }

  componentDidMount() {
    if (this.props.fetchPlugins) {
      this.props.fetchPlugins().then(() =>
        this.setState({
          fetched: true,
        })
      );
    }
  }

  render(): JSX.Element {
    return (
      <div className="plugin-list-sidebar">
        <h2>Plugins</h2>
        <ul>
          {this.state.fetched &&
            this.props.plugins &&
            this.props.plugins.map((entry) =>
              this.renderListInfo(entry, this.props.library)
            )}
        </ul>
      </div>
    );
  }

  renderListInfo(entry: PluginData, library: LibraryData): JSX.Element {
    const activeStatus = entry.name === this.activePluginName ? "active" : "";
    return (
      <li key={entry.name} className={"plugin-entry" + " " + activeStatus}>
        <div className="li">
          <a
            href={"/admin/web/plugin/" + library.short_name + "/" + entry.name}
          >
            {entry.name}
          </a>
        </div>
      </li>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchPlugins: () => dispatch(actions.fetchPlugins()),
  };
}

function mapStateToProps(state) {
  return {
    plugins: Object.assign(
      [],
      (state.editor.plugins &&
        state.editor.plugins.data &&
        state.editor.plugins.data.available) ||
        {}
    ),
  };
}

const ConnectedPluginSidebar = connect<PluginListsSidebarProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(PluginListsSidebar);

export default ConnectedPluginSidebar;
