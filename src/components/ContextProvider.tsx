import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import buildStore, { RootState } from "../store";
import { ConfigurationSettings, PathFor } from "../interfaces";
import Admin from "../models/Admin";
import PathForProvider from "@thepalaceproject/web-opds-client/lib/components/context/PathForContext";
import ActionCreator from "../actions";
import AppContextProvider, {
  AppContextType,
  supportContactLinkFromConfig,
} from "../context/appContext";

// Note: Not all elements of these props make it into the `ContextProvider`.
//  Some are exposed only through the `AppContextProvider` component (which
//  this component wraps).
// TODO: We should get this interface to the point where we can just extend
//  the `ConfigurationSettings` interface.
export interface ContextProviderProps extends React.Props<ContextProvider> {
  store?: Store<RootState>;
  config: Partial<ConfigurationSettings>;
}

/** Provides a redux store, configuration options, and a function to create URLs
    as context to admin interface pages. */
export default class ContextProvider extends React.Component<
  ContextProviderProps
> {
  store: Store<RootState>;
  admin: Admin;
  appConfig: ConfigurationSettings;
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.store = props.store ?? buildStore();
    this.appConfig = props.config;
    this.admin = new Admin(
      props.config.roles || [],
      props.config.email || null
    );
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "/admin/web";
      path += collectionUrl
        ? `/collection/${this.prepareCollectionUrl(collectionUrl)}`
        : "";
      path += bookUrl ? `/book/${this.prepareBookUrl(bookUrl)}` : "";
      path += tab ? `/tab/${tab}` : "";
      return path;
    };
  }

  componentDidMount() {
    this.storeConfiguration();
  }

  storeConfiguration() {
    const actions = new ActionCreator();

    this.store.dispatch(actions.setFeatureFlags(this.appConfig.featureFlags));
  }

  prepareCollectionUrl(url: string): string {
    return encodeURIComponent(
      url
        .replace(document.location.origin + "/", "")
        .replace(/\/$/, "")
        .replace(/^\//, "")
    );
  }

  prepareBookUrl(url: string): string {
    const regexp = new RegExp(document.location.origin + "/(.*)/works/(.*)");
    const match = regexp.exec(url);
    if (match) {
      const library = match[1];
      const work = match[2];
      return encodeURIComponent(library + "/" + work);
    } else {
      return url;
    }
  }

  static childContextTypes: React.ValidationMap<object> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired,
    settingUp: PropTypes.bool.isRequired,
    admin: PropTypes.object.isRequired,
    featureFlags: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      editorStore: this.store,
      csrfToken: this.appConfig.csrfToken,
      settingUp: this.appConfig.settingUp || false,
      admin: this.admin,
      featureFlags: this.appConfig.featureFlags,
    };
  }

  render() {
    const appContextValue: AppContextType = {
      admin: this.admin,
      csrfToken: this.appConfig.csrfToken,
      settingUp: this.appConfig.settingUp,
      featureFlags: this.appConfig.featureFlags,
      quicksightPagePath: this.appConfig.quicksightPagePath,
      dashboardCollectionsBarChart: this.appConfig.dashboardCollectionsBarChart,
      tos_link_text: this.appConfig.tos_link_text,
      tos_link_href: this.appConfig.tos_link_href,
      supportContact: supportContactLinkFromConfig(this.appConfig),
    };
    return (
      <PathForProvider pathFor={this.pathFor}>
        <AppContextProvider value={appContextValue}>
          {React.Children.only(this.props.children) as JSX.Element}
        </AppContextProvider>
      </PathForProvider>
    );
  }
}
