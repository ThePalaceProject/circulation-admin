/* eslint-disable */
import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSCatalog = require("@thepalaceproject/web-opds-client");
import * as PropTypes from "prop-types";
import { ActionsProvider } from "@thepalaceproject/web-opds-client/lib/components/context/ActionsContext";
import BookDetailsContainer from "./BookDetailsContainer";
import Header from "./Header";
import Footer from "./Footer";
import computeBreadcrumbs from "../computeBreadcrumbs";
import EntryPointsContainer from "./EntryPointsContainer";
import WelcomePage from "./WelcomePage";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionsCreator from "@thepalaceproject/web-opds-client/lib/actions";
import { adapter } from "@thepalaceproject/web-opds-client/lib/OPDSDataAdapter";
import title from "../utils/title";
import NoCacheDataFetcher from "../utils/NoCacheDataFetcher";

export interface CatalogPageProps extends React.Props<CatalogPage> {
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

/** Extracts URL parameters and renders the OPDS Web Client for the appropriate catalog
    and book, using the admin interface header and book details wrapper with extra tabs. */
export default class CatalogPage extends React.Component<CatalogPageProps, {}> {
  static childContextTypes: React.ValidationMap<any> = {
    tab: PropTypes.string,
    library: PropTypes.func,
  };

  getChildContext() {
    return {
      tab: this.props.params.tab,
      library: () =>
        this.getLibrary(
          this.props.params.collectionUrl,
          this.props.params.bookUrl
        ),
    };
  }

  render(): JSX.Element {
    if (!this.hasLibrary()) {
      return <WelcomePage />;
    }

    let { collectionUrl, bookUrl } = this.props.params;

    collectionUrl = this.expandCollectionUrl(collectionUrl) || null;
    bookUrl = this.expandBookUrl(bookUrl) || null;

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return title(details);
    };

    const fetcher = new NoCacheDataFetcher({ adapter });
    const actions = new ActionsCreator(fetcher);
    return (
      <>
        <ActionsProvider actions={actions} fetcher={fetcher}>
          <OPDSCatalog
            collectionUrl={collectionUrl}
            bookUrl={bookUrl}
            BookDetailsContainer={BookDetailsContainer}
            Header={Header}
            pageTitleTemplate={pageTitleTemplate}
            computeBreadcrumbs={computeBreadcrumbs}
            CollectionContainer={EntryPointsContainer}
            allLanguageSearch={true}
            fetcher={fetcher}
          />
        </ActionsProvider>
        <Footer />
      </>
    );
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
    let library = this.getLibrary(
      this.props.params.collectionUrl,
      this.props.params.bookUrl
    );
    return !!library;
  }

  expandCollectionUrl(url: string): string {
    return url ? `${document.location.origin}/${url}` : url;
  }

  expandBookUrl(url: string): string {
    if (url) {
      const library = this.getLibrary(null, url);
      return (
        document.location.origin +
        "/" +
        library +
        "/works/" +
        url.replace(library + "/", "")
      );
    } else {
      return url;
    }
  }
}
