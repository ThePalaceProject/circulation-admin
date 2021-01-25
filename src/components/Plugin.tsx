import * as React from "react";
import { PluginData, LibraryData } from "../interfaces";
import PluginListsSidebar from "./PluginListSidebar";
import PluginEditor from "./PluginEditor";
import { Store } from "redux";
import { State } from "../reducers/index";

export interface PluginsStateProps {
  store?: Store<State>;
  library: LibraryData;
  plugin: PluginData;
}

export class Plugin extends React.Component<PluginsStateProps, {}> {
  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <main className="plugin-container">
        <div className="plugins">
          <PluginListsSidebar
            store={this.props.store}
            library={this.props.library}
            activePlugin={this.props.plugin}
          />
          <PluginEditor
            store={this.props.store}
            library={this.props.library}
            plugin={this.props.plugin}
          />
        </div>
      </main>
    );
  }
}
