import * as React from "react";
import { Store } from "redux";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State } from "../reducers/index";
import Admin from "../models/Admin";

export interface ContextProviderProps extends React.Props<any> {
  csrfToken: string;
  showCircEventsDownload?: boolean;
  settingUp?: boolean;
  email?: string;
  roles?: {
    role: string;
    library?: string;
  }[];
}

/** Provides a redux store, configuration options, and a function to create URLs
    as context to admin interface pages. */
export default class ContextProvider extends React.Component<ContextProviderProps, void> {
  store: Store<State>;
  admin: Admin;
  pathFor: PathFor;

  constructor(props) {
    super(props);
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

  static childContextTypes: React.ValidationMap<any> = {
    editorStore: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
    showCircEventsDownload: React.PropTypes.bool.isRequired,
    settingUp: React.PropTypes.bool.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      editorStore: this.store,
      pathFor: this.pathFor,
      csrfToken: this.props.csrfToken,
      showCircEventsDownload: this.props.showCircEventsDownload || false,
      settingUp: this.props.settingUp || false,
      admin: this.admin
    };
  }

  render() {
    return React.Children.only(this.props.children) as JSX.Element;
  };
};
