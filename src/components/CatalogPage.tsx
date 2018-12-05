import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { ComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";
import reducers from "../reducers/index";
import BookDetailsContainer from "./BookDetailsContainer";
import Header from "./Header";
import { BookLink } from "../interfaces";
import computeBreadcrumbs from "../computeBreadcrumbs";
import EntryPointsContainer from "./EntryPointsContainer";
import WelcomePage from "./WelcomePage";

export interface CatalogPageProps extends React.Props<CatalogPage> {
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

/** Extracts URL parameters and renders the OPDS Web Client for the appropriate catalog
    and book, using the admin interface header and book details wrapper with extra tabs. */
export default class CatalogPage extends React.Component<CatalogPageProps, void> {
  static childContextTypes: React.ValidationMap<any> = {
    tab: React.PropTypes.string,
    library: React.PropTypes.func
  };

  getChildContext() {
    return {
      tab: this.props.params.tab,
      library: () => this.getLibrary(this.props.params.collectionUrl, this.props.params.bookUrl)
    };
  }

  getLibrary(collectionUrl, bookUrl): string {
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

  hasLibrary(): boolean {
    let library = this.getLibrary(this.props.params.collectionUrl, this.props.params.bookUrl);
    return !!(library);
  }

  expandCollectionUrl(url: string): string {
    return url ?
      document.location.origin + "/" + url :
      url;
  }

  expandBookUrl(url: string): string {
    if (url) {
      const library = this.getLibrary(null, url);
      return document.location.origin + "/" + library + "/works/" + url.replace(library + "/", "");
    } else {
      return url;
    }
  }

  render(): JSX.Element {
    if (!this.hasLibrary()) {
      return (
        <WelcomePage />
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
        CollectionContainer={EntryPointsContainer}
        allLanguageSearch={true}
      />
    );
  }
}
