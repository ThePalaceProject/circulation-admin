/* eslint-disable */
import * as React from "react";
import * as ReactDOM from "react-dom";
const OPDSCatalog = require("@thepalaceproject/web-opds-client");
import { ActionsProvider } from "@thepalaceproject/web-opds-client/lib/components/context/ActionsContext";
import BookDetailsContainer from "../book/BookDetailsContainer";
import Header from "../layout/Header";
import computeBreadcrumbs from "../../computeBreadcrumbs";
import EntryPointsContainer from "../shared/EntryPointsContainer";
import WelcomePage from "../layout/WelcomePage";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionsCreator from "@thepalaceproject/web-opds-client/lib/actions";
import { adapter } from "@thepalaceproject/web-opds-client/lib/OPDSDataAdapter";
import title from "../../utils/title";
import NoCacheDataFetcher from "../../utils/NoCacheDataFetcher";
import { LibraryContext } from "../../context/LibraryContext";
import { CatalogTabContext } from "../../context/CatalogTabContext";

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
    const libraryFn = () => this.getLibrary(collectionUrl, bookUrl);
    return (
      <LibraryContext.Provider value={libraryFn}>
        <CatalogTabContext.Provider value={this.props.params.tab}>
          <div className="catalog-page">
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
          </div>
        </CatalogTabContext.Provider>
      </LibraryContext.Provider>
    );
  }

  getLibrary(collectionUrl, bookUrl): string {
    if (collectionUrl) {
      let urlParts = this.cleanRelativePath(collectionUrl).split("/");
      if (urlParts.length > 0) {
        return urlParts[0];
      }
    }
    if (bookUrl) {
      let urlParts = this.cleanRelativePath(bookUrl).split("/");
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

  private cleanRelativePath(url: string): string {
    if (!url) {
      return url;
    }

    // Route params can occasionally contain malformed protocol-like prefixes
    // such as "http:/groups". Treat these as relative paths.
    const malformedProtocolPrefix = /^https?:\/(?!\/)/i;
    if (malformedProtocolPrefix.test(url)) {
      return url.replace(/^https?:\/+/, "").replace(/^\/+/, "");
    }

    const absoluteProtocolPrefix = /^https?:\/\//i;
    if (absoluteProtocolPrefix.test(url)) {
      try {
        const parsed = new URL(url);
        return parsed.pathname.replace(/^\/+/, "");
      } catch {
        return url.replace(/^\/+/, "");
      }
    }

    return url.replace(/^\/+/, "");
  }

  expandCollectionUrl(url: string): string {
    if (!url) {
      return url;
    }

    const cleanUrl = this.cleanRelativePath(url);
    return `${document.location.origin}/${cleanUrl}`;
  }

  expandBookUrl(url: string): string {
    if (url) {
      const cleanUrl = this.cleanRelativePath(url);
      const library = this.getLibrary(null, cleanUrl);
      return (
        document.location.origin +
        "/" +
        library +
        "/works/" +
        cleanUrl.replace(library + "/", "")
      );
    } else {
      return url;
    }
  }
}
