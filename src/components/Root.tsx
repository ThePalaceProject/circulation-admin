import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { ComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";
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
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export interface RootContext {
  homeUrl: string;
}

export default class Root extends React.Component<RootProps, any> {
  context: RootContext;
  pageTitleTemplate: (collectionTitle: string, bookTitle: string) => string;

  constructor(props) {
    super(props);

    let title = document.title || "Circulation Manager";
    this.pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return title + (details ? " - " + details : "");
    };
  }

  static contextTypes: React.ValidationMap<RootContext> = {
    homeUrl: React.PropTypes.string.isRequired
  }

  static childContextTypes: React.ValidationMap<any> = {
    tab: React.PropTypes.string
  };

  getChildContext() {
    return {
      tab: this.props.params.tab
    };
  }

  render(): JSX.Element {
    let { collectionUrl, bookUrl } = this.props.params;

    collectionUrl = collectionUrl ? decodeURIComponent(collectionUrl) : (this.context.homeUrl || null);
    bookUrl = bookUrl ? decodeURIComponent(bookUrl) : null;

    return (
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        BookDetailsContainer={BookDetailsContainer}
        Header={Header}
        pageTitleTemplate={this.pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        />
    );
  }
}