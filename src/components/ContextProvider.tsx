import * as React from "react";
import buildStore from "../store";
import { PathFor } from "../interfaces";

export interface ContextProviderProps extends React.Props<any> {
  csrfToken: string;
  homeUrl: string;
  showCircEventsDownload?: boolean;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  store: Redux.Store;
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.store = buildStore();
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
    return encodeURIComponent(url.replace(document.location.origin + "/", ""));
  }

  prepareBookUrl(url: string): string {
    return encodeURIComponent(url.replace(document.location.origin + "/works/", ""));
  }

  static childContextTypes: React.ValidationMap<any> = {
    editorStore: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
    showCircEventsDownload: React.PropTypes.bool.isRequired
  };

  getChildContext() {
    return {
      editorStore: this.store,
      pathFor: this.pathFor,
      csrfToken: this.props.csrfToken,
      homeUrl: this.props.homeUrl,
      showCircEventsDownload: this.props.showCircEventsDownload || false
    };
  }

  render() {
    return React.Children.only(this.props.children) as JSX.Element;
  };
};