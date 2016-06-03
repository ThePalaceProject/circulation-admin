import * as React from "react";
import buildStore from "../store";
import { PathFor } from "../interfaces";

export interface ContextProviderProps extends React.Props<any> {
  csrfToken: string;
  homeUrl: string;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  store: Redux.Store;
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.store = buildStore();
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "/admin/web";
      path += collectionUrl ? `/collection/${encodeURIComponent(collectionUrl)}` : "";
      path += bookUrl ? `/book/${encodeURIComponent(bookUrl)}` : "";
      path += tab ? `/tab/${tab}` : "";
      return path;
    }
  }

  static childContextTypes: React.ValidationMap<any> = {
    editorStore: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    csrfToken: React.PropTypes.string.isRequired,
    homeUrl: React.PropTypes.string.isRequired
  };

  getChildContext() {
    return {
      editorStore: this.store,
      pathFor: this.pathFor,
      csrfToken: this.props.csrfToken,
      homeUrl: this.props.homeUrl
    };
  }

  render() {
    return React.Children.only(this.props.children) as JSX.Element;
  };
};