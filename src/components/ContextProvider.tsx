import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import buildStore, { RootState } from "../store";
import {
  ConfigurationSettings,
  DashboardCollectionsBarChart,
  FeatureFlags,
  PathFor,
} from "../interfaces";
import Admin from "../models/Admin";
import PathForProvider from "@thepalaceproject/web-opds-client/lib/components/context/PathForContext";
import ActionCreator from "../actions";
import AppContextProvider, { AppContextType } from "../context/appContext";

// Note: Not all elements of these props make it into the `ContextProvider`.
//  Some are exposed only through the `AppContextProvider` component (which
//  this component wraps).
// TODO: We should get this interface to the point where we can just extend
//  the `ConfigurationSettings` interface.
export interface ContextProviderProps extends React.Props<ContextProvider> {
  store?: Store<RootState>;
  config: Partial<ConfigurationSettings>;
  csrfToken: string;
  showCircEventsDownload?: boolean;
  settingUp?: boolean;
  email?: string;
  roles?: {
    role: string;
    library?: string;
  }[];
  tos_link_text?: string;
  tos_link_href?: string;
  support_contact_url?: string;
  featureFlags: FeatureFlags;
  quicksightPagePath?: string;
  dashboardCollectionsBarChart?: DashboardCollectionsBarChart;
}

/** Provides a redux store, configuration options, and a function to create URLs
    as context to admin interface pages. */
export default class ContextProvider extends React.Component<
  ContextProviderProps
> {
  store: Store<RootState>;
  admin: Admin;
  config: ConfigurationSettings;
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.store = props.store ?? buildStore();
    this.config = props.config;
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

    this.store.dispatch(actions.setFeatureFlags(this.config.featureFlags));
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
      csrfToken: this.config.csrfToken,
      settingUp: this.config.settingUp || false,
      admin: this.admin,
      featureFlags: this.config.featureFlags,
    };
  }

  render() {
    const appContextValue: AppContextType = {
      csrfToken: this.config.csrfToken,
      settingUp: this.config.settingUp,
      admin: this.admin,
      featureFlags: this.config.featureFlags,
      quicksightPagePath: this.config.quicksightPagePath,
      dashboardCollectionsBarChart: this.config.dashboardCollectionsBarChart,
      tos_link_text: this.config.tos_link_text,
      tos_link_href: this.config.tos_link_href,
      support_contact_url: this.config.support_contact_url,
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
