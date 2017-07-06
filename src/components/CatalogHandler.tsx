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
import computeBreadcrumbs from "../computeBreadcrumbs";

export interface CatalogHandlerProps extends React.Props<CatalogHandler> {
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {
  static childContextTypes: React.ValidationMap<any> = {
    tab: React.PropTypes.string,
    library: React.PropTypes.string
  };

  getChildContext() {
    return {
      tab: this.props.params.tab,
      library: this.getLibrary()
    };
  }

  getLibrary(): string {
    let { collectionUrl, bookUrl } = this.props.params;
    if (collectionUrl) {
      let urlParts = collectionUrl.split("/");
      if (urlParts.length > 0) {
        return urlParts[0];
      }
    }
    if (bookUrl) {
      let urlParts = bookUrl.split("/");
      if (urlParts.length > 0) {
        return urlParts[0];
      }
    }
    return null;
  }

  expandCollectionUrl(url: string): string {
    return url ?
      document.location.origin + "/" + url :
      url;
  }

  expandBookUrl(url: string): string {
    return url ?
      document.location.origin + "/works/" + url :
      url;
  }

  render(): JSX.Element {
    if (!this.getLibrary()) {
      return (
        <Header />
      );
    }

    let { collectionUrl, bookUrl } = this.props.params;

    collectionUrl =
      this.expandCollectionUrl(collectionUrl) ||
      null;
    bookUrl = this.expandBookUrl(bookUrl) || null;

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