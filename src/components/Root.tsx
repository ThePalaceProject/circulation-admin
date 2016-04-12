import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSBrowser = require("opds-browser");
import buildStore from "../store";
import Editor from "./Editor";
import reducers from "../reducers/index";
import BookDetailsContainer, { BookDetailsContainerContext } from "./BookDetailsContainer";
import Header, { HeaderContext } from "./Header";
import * as qs from "qs";

export interface RootProps extends React.Props<Root> {
  csrfToken: string;
  collectionUrl: string;
  bookUrl: string;
  tab: string;
  isTopLevel: boolean;
  navigate: Navigate;
  bookLinks?: BookLink[];
}

export interface RootContext extends BookDetailsContainerContext, HeaderContext {
}

export default class Root extends React.Component<RootProps, any> {
  pageTitleTemplate: (collectionTitle: string, bookTitle: string) => string;
  pathFor: (collectionUrl: string, bookUrl: string) => string;
  editorStore: Redux.Store;

  constructor(props) {
    super(props);
    let that = this;

    this.editorStore = buildStore();

    let title = document.title || "Circulation Manager";
    this.pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return title + (details ? " - " + details : "");
    };

    this.pathFor = (collection, book) => {
      if (collection || book) {
        return "?" + qs.stringify({ collection, book }, { skipNulls:  true });
      } else {
        return null;
      }
    };
  }

  static childContextTypes = {
    csrfToken: React.PropTypes.string.isRequired,
    tab: React.PropTypes.string,
    navigate: React.PropTypes.func.isRequired,
    editorStore: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired
  };

  getChildContext(): RootContext {
    return {
      csrfToken: this.props.csrfToken,
      tab: this.props.tab,
      navigate: this.props.navigate,
      editorStore: this.editorStore,
      pathFor: this.pathFor
    };
  }

  render(): JSX.Element {
    return (
      <OPDSBrowser
        collectionUrl={this.props.collectionUrl}
        bookUrl={this.props.bookUrl}
        isTopLevel={this.props.isTopLevel}
        pathFor={this.pathFor}
        navigate={this.props.navigate}
        BookDetailsContainer={BookDetailsContainer}
        header={Header}
        pageTitleTemplate={this.pageTitleTemplate}
        />
    );
  }
}