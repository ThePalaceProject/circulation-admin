import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSBrowser = require("opds-browser");
import { Navigate } from "../interfaces";
import { NavigateContext } from "opds-browser/lib/interfaces";
import buildStore from "../store";
import Editor from "./Editor";
import reducers from "../reducers/index";
import BookDetailsContainer, { BookDetailsContainerContext } from "./BookDetailsContainer";
import Header from "./Header";
import { BookLink } from "../interfaces";
import * as qs from "qs";
import createRouter from "../createRouter";

export interface RootProps extends React.Props<Root> {
  csrfToken: string;
  collectionUrl: string;
  bookUrl: string;
  tab: string;
  isTopLevel: boolean;
  bookLinks?: BookLink[];
  navigate: Navigate;
}

export interface RootContext extends BookDetailsContainerContext, NavigateContext {
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
    pathFor: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired
  };

  getChildContext(): RootContext {
    return {
      csrfToken: this.props.csrfToken,
      tab: this.props.tab,
      editorStore: this.editorStore,
      navigate: this.props.navigate,
      pathFor: this.pathFor,
      router: createRouter(this.props.navigate)
    };
  }

  render(): JSX.Element {
    return (
      <OPDSBrowser
        collectionUrl={this.props.collectionUrl}
        bookUrl={this.props.bookUrl}
        isTopLevel={this.props.isTopLevel}
        BookDetailsContainer={BookDetailsContainer}
        Header={Header}
        pageTitleTemplate={this.pageTitleTemplate}
        />
    );
  }
}