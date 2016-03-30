import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSBrowser = require("opds-browser");
import buildStore from "../store";
import Editor from "./Editor";
import reducers from "../reducers/index";
import createBookDetailsContainer from "./BookDetailsContainer";
import Header from "./Header";
import * as qs from "qs";

export default class Root extends React.Component<RootProps, any> {
  browser: any;
  bookDetailsContainer: any;
  browserNavigate: (collectionUrl: string, bookUrl: string, isTopLevel: boolean) => void;
  bookContainerNavigate: (collectionUrl: string, bookUrl: string, tab: string) => void;
  pageTitleTemplate: (collectionTitle: string, bookTitle: string) => string;

  constructor(props) {
    super(props);
    let that = this;

    this.browserNavigate = (collectionUrl: string, bookUrl: string, isTopLevel: boolean) => {
      that.props.navigate(collectionUrl, bookUrl, that.props.tab, isTopLevel);
    }

    this.bookContainerNavigate = (collectionUrl: string, bookUrl: string, tab: string) => {
      that.props.navigate(collectionUrl, bookUrl, tab, false);
    }

    this.bookDetailsContainer = createBookDetailsContainer({
      editorStore: buildStore(),
      csrfToken: this.props.csrfToken,
      navigate: this.bookContainerNavigate,
      refreshBook: this.refreshBook.bind(this),
      tab: this.props.tab
    });

    let title = document.title || "Circulation Manager";
    this.pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return title + (details ? " - " + details : "");
    };
  }

  render(): JSX.Element {
    let pathFor = (collection, book) => {
      if (collection || book) {
        return "?" + qs.stringify({ collection, book }, { skipNulls:  true });
      } else {
        return null;
      }
    };

    return (
      <OPDSBrowser
        ref={c => this.browser = c}
        collectionUrl={this.props.collection}
        bookUrl={this.props.book}
        isTopLevel={this.props.isTopLevel}
        pathFor={pathFor}
        navigate={this.browserNavigate}
        BookDetailsContainer={this.bookDetailsContainer}
        header={Header}
        pageTitleTemplate={this.pageTitleTemplate}
        />
    );
  }

  refreshBook(): Promise<any> {
    return this.browser.refreshBook();
  }
}