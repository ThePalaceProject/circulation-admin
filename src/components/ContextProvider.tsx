import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State } from "../reducers/index";
import Admin from "../models/Admin";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";

export interface ContextProviderProps extends React.Props<{}> {
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
}

/** Provides a redux store, configuration options, and a function to create URLs
    as context to admin interface pages. */
export default class ContextProvider extends React.Component<ContextProviderProps, {}> {
  store: Store<State>;
  admin: Admin;
  pathFor: PathFor;

  constructor(props) {
    super(props);
    // console.log(props);
    this.store = buildStore();
    this.admin = new Admin(props.roles || [], props.email || null);
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "/admin/web";
      path +=
        collectionUrl ?
        `/collection/${this.prepareCollectionUrl(collectionUrl)}` :
        "";
      path +=
        bookUrl ?
        `/book/${this.prepareBookUrl(bookUrl)}` :
        "";
      path += tab ? `/tab/${tab}` : "";
      return path;
    };
  }

  prepareCollectionUrl(url: string): string {
    return encodeURIComponent(
      url.replace(document.location.origin + "/", "").replace(/\/$/, "").replace(/^\//, "")
    );
  }

  prepareBookUrl(url: string): string {
    const regexp = new RegExp(document.location.origin + "/(.*)/works/(.*)");
    const match = regexp.exec(url);
    if (match) {
      const library = match[1];
      const work = match[2];
      return encodeURIComponent(
        library + "/" + work
      );
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
    tos_link_text: PropTypes.string,
    tos_link_href: PropTypes.string
  };

  getChildContext() {
    return {
      editorStore: this.store,
      csrfToken: this.props.csrfToken,
      showCircEventsDownload: this.props.showCircEventsDownload || false,
      settingUp: this.props.settingUp || false,
      admin: this.admin,
      tos_link_text: this.props.tos_link_text,
      tos_link_href: this.props.tos_link_href
    };
  }

  render() {
    return (
      <PathForProvider pathFor={this.pathFor}>
        {React.Children.only(this.props.children) as JSX.Element}
      </PathForProvider>
    );
  }
}
