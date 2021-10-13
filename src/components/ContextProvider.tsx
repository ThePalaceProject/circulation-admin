import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State } from "../reducers/index";
import Admin from "../models/Admin";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import {
  ListManagerProvider,
  ListManagerProviderProps,
} from "./ListManagerContext";

export interface ContextProviderProps extends React.Props<{}> {
  csrfToken: string;
  showCircEventsDownload?: boolean;
  settingUp?: boolean;
  email?: string;
  roles?: {
    role: string;
    library?: string;
  }[];
  listManagerProps?: ListManagerProviderProps;
}

/** Provides a redux store, configuration options, and a function to create URLs
    as context to admin interface pages. */
export default class ContextProvider extends React.Component<
  ContextProviderProps,
  {}
> {
  store: Store<State>;
  admin: Admin;
  pathFor: PathFor;
  listManagerProps: ListManagerProviderProps;

  constructor(props) {
    super(props);
    this.store = buildStore();
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
    this.listManagerProps = {
      email: props.email,
      roles: props.roles,
      csrfToken: props.csrfToken,
      editorStore: this.store,
    };
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

  static childContextTypes: React.ValidationMap<{}> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired,
    showCircEventsDownload: PropTypes.bool.isRequired,
    settingUp: PropTypes.bool.isRequired,
    admin: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      editorStore: this.store,
      csrfToken: this.props.csrfToken,
      showCircEventsDownload: this.props.showCircEventsDownload || false,
      settingUp: this.props.settingUp || false,
      admin: this.admin,
    };
  }

  render() {
    return (
      <PathForProvider pathFor={this.pathFor}>
        <ListManagerProvider {...this.listManagerProps}>
          {React.Children.only(this.props.children) as JSX.Element}
        </ListManagerProvider>
      </PathForProvider>
    );
  }
}
