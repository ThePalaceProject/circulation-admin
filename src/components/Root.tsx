import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { ComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";
import buildStore from "../store";
import Editor from "./Editor";
import reducers from "../reducers/index";
import BookDetailsContainer, { BookDetailsContainerContext } from "./BookDetailsContainer";
import Header from "./Header";
import { BookLink } from "../interfaces";
import * as qs from "qs";
import createRouter from "../createRouter";
import computeBreadcrumbs from "../computeBreadcrumbs";

export interface RootProps extends React.Props<Root> {
  csrfToken: string;
  collectionUrl: string;
  bookUrl: string;
  tab: string;
  bookLinks?: BookLink[];
}

export interface RootContext extends BookDetailsContainerContext {
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

    this.pathFor = (collectionUrl: string, bookUrl: string) => {
      var path = "/";
      path += collectionUrl ? `collection/${encodeURIComponent(collectionUrl)}/` : "";
      path += bookUrl ? `book/${encodeURIComponent(bookUrl)}/` : "";
      return path;
    };
  }

  static childContextTypes = {
    csrfToken: React.PropTypes.string.isRequired,
    tab: React.PropTypes.string,
    editorStore: React.PropTypes.object.isRequired,
  };

  getChildContext(): RootContext {
    return {
      csrfToken: this.props.csrfToken,
      tab: this.props.tab,
      editorStore: this.editorStore
    };
  }

  render(): JSX.Element {
    return (
      <OPDSCatalog
        collectionUrl={this.props.collectionUrl}
        bookUrl={this.props.bookUrl}
        BookDetailsContainer={BookDetailsContainer}
        Header={Header}
        pageTitleTemplate={this.pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        />
    );
  }
}