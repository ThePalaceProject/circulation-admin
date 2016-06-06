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

export interface CatalogHandlerProps extends React.Props<CatalogHandler> {
  csrfToken: string;
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export interface CatalogHandlerContext {
  homeUrl: string;
}

export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {
  context: CatalogHandlerContext;

  static contextTypes: React.ValidationMap<CatalogHandlerContext> = {
    homeUrl: React.PropTypes.string.isRequired
  };

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

    collectionUrl = collectionUrl || this.context.homeUrl || null;
    bookUrl = bookUrl || null;

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return "Circulation Manager" + (details ? " - " + details : "");
    };

    return (
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        BookDetailsContainer={BookDetailsContainer}
        Header={Header}
        pageTitleTemplate={pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        />
    );
  }
}