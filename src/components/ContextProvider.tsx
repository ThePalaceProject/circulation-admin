import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";
import buildStore, { RootState } from "../store";
import {
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
  csrfToken: string;
  showCircEventsDownload?: boolean;
  settingUp?: boolean;
  email?: string;
  roles?: {
    role: string;
    library?: string;
  }[];
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
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.store = props.store ?? buildStore();
    this.admin = new Admin(props.roles || [], props.email || null);
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

    this.store.dispatch(actions.setFeatureFlags(this.props.featureFlags));
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
    showCircEventsDownload: PropTypes.bool.isRequired,
    settingUp: PropTypes.bool.isRequired,
    admin: PropTypes.object.isRequired,
    featureFlags: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      editorStore: this.store,
      csrfToken: this.props.csrfToken,
      showCircEventsDownload: this.props.showCircEventsDownload || false,
      settingUp: this.props.settingUp || false,
      admin: this.admin,
      featureFlags: this.props.featureFlags,
    };
  }

  render() {
    const appContextValue: AppContextType = {
      csrfToken: this.props.csrfToken,
      settingUp: this.props.settingUp,
      admin: this.admin,
      featureFlags: this.props.featureFlags,
      quicksightPagePath: this.props.quicksightPagePath,
      dashboardCollectionsBarChart: this.props.dashboardCollectionsBarChart,
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
