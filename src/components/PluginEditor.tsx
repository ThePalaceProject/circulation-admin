import * as React from "react";
import { PluginConfig, LibraryData } from "../interfaces";
import { Store } from "redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import { connect } from "react-redux";
import PluginEditForm from "./PluginEditForm";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";

export interface PluginEditorProps {
  store?: Store<State>;
  library: LibraryData;
  plugin: PluginConfig;
  fetchData: () => Promise<PluginConfig>;
  updatePlugin?: (
    library: string,
    plugin: string,
    data: FormData
  ) => Promise<void>;
}

export interface PluginEditorEventsState {
  fetched: boolean;
  pluginConfig: PluginConfig;
}

export class PluginEditor extends React.Component<
  PluginEditorProps,
  PluginEditorEventsState
> {
  constructor(props) {
    super(props);
    this.state = {
      fetched: false,
      pluginConfig: undefined,
    };
  }

  componentDidMount() {
    if (
      this.props.library &&
      this.props.library.short_name &&
      this.props.plugin &&
      this.props.plugin.name &&
      this.props.fetchData
    ) {
      this.props.fetchData().then((result) =>
        this.setState({
          fetched: true,
          pluginConfig: result,
        })
      );
    }
  }

  render(): JSX.Element {
    /** Right panel of the lists page for configure a single plugin. */
    if (!this.props.plugin || !this.props.plugin.name) {
      return (
        <div className="missing-plugin">
          <p> Please select a plugin. </p>
        </div>
      );
    }
    return (
      <div className="plugin-editor">
        <h2>{this.props.plugin && this.props.plugin.name}</h2>

        {!this.state.fetched && <LoadingIndicator />}

        {this.state.fetched && this.state.pluginConfig && (
          <PluginEditForm
            plugin={this.state.pluginConfig}
            library={this.props.library}
            updatePlugin={this.props.updatePlugin}
          />
        )}

        {this.state.fetched && !this.state.pluginConfig && (
          <p> Something went wrong, please refresh the page. </p>
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchData: () =>
      dispatch(
        actions.fetchPlugin(ownProps.library.short_name, ownProps.plugin.name)
      ),
    updatePlugin: (library: string, plugin: string, data: FormData) =>
      dispatch(actions.updatePlugin(library, plugin, data)),
  };
}

function mapStateToProps(state) {
  return {
    pluginConfig: Object.assign(
      {},
      (state.editor.plugin &&
        state.editor.plugin.data &&
        state.editor.plugins.data.config) ||
        {}
    ),
  };
}

const ConnectedPluginEditor = connect<PluginEditorProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(PluginEditor);

export default ConnectedPluginEditor;
