/* eslint-disable @typescript-eslint/camelcase */
import * as React from "react";
import { Store } from "redux";
import { State } from "../reducers/index";
import Header from "./Header";
import Footer from "./Footer";
import { Plugin } from "./Plugin";
import { PluginData, LibraryData } from "../interfaces";
import * as PropTypes from "prop-types";

export interface PluginPageProps {
  params: {
    library: string;
    plugin?: string;
  };
}

export interface PluginsPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export default class PluginPage extends React.Component<
  PluginPageProps,
  PluginsPageContext
> {
  context: PluginsPageContext;
  libraryObject: LibraryData;
  pluginObject: PluginData;

  static contextTypes: React.ValidationMap<PluginsPageContext> = {
    editorStore: PropTypes.object.isRequired as React.Validator<Store>,
    csrfToken: PropTypes.string.isRequired,
  };

  static childContextTypes: React.ValidationMap<any> = {
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      library: () => this.libraryObject.name,
    };
  }

  constructor(props) {
    super(props);
    if (this.props.params.library) {
      this.libraryObject = {
        name: undefined,
        short_name: this.props.params.library,
      } as LibraryData;
    } else {
      this.libraryObject = undefined;
    }
    if (this.props.params.plugin) {
      this.pluginObject = { name: this.props.params.plugin } as PluginData;
    } else {
      this.pluginObject = undefined;
    }
  }

  componentDidMount() {
    this.forceUpdate();
  }

  render(): JSX.Element {
    document.title = "Circulation Manager - Plugins";
    return (
      <div className="plugins-page">
        <Header />
        <Plugin
          store={this.context.editorStore}
          library={this.libraryObject}
          plugin={this.pluginObject}
        />
        <Footer />
      </div>
    );
  }
}
