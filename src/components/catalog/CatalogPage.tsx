/* eslint-disable */
import * as React from "react";
import { useContext } from "react";
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
import { NavigationContext } from "@thepalaceproject/web-opds-client/lib/components/context/NavigationContext";
import { PathForContext } from "@thepalaceproject/web-opds-client/lib/components/context/PathForContext";

export interface CatalogPageProps {
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

/** Extracts URL parameters and renders the OPDS Web Client for the appropriate catalog
    and book, using the admin interface header and book details wrapper with extra tabs. */
export default function CatalogPage(props: CatalogPageProps) {
  // Get navigation and pathFor from context
  const router = useContext(NavigationContext);
  const pathFor = useContext(PathForContext);

  function getLibrary(collectionUrl, bookUrl): string {
    if (collectionUrl) {
      let urlParts = cleanRelativePath(collectionUrl).split("/");
      if (urlParts.length > 0) {
        return urlParts[0];
      }
    }
    if (bookUrl) {
      let urlParts = cleanRelativePath(bookUrl).split("/");
      if (urlParts.length > 0) {
        return urlParts[0];
      }
    }
    return null;
  }

  function hasLibrary(): boolean {
    let library = getLibrary(props.params.collectionUrl, props.params.bookUrl);
    return !!library;
  }

  function cleanRelativePath(url: string): string {
    if (!url) {
      return url;
    }
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

  function expandCollectionUrl(url: string): string {
    if (!url) {
      return url;
    }
    const cleanUrl = cleanRelativePath(url);
    return `${document.location.origin}/${cleanUrl}`;
  }

  function expandBookUrl(url: string): string {
    if (url) {
      const cleanUrl = cleanRelativePath(url);
      const library = getLibrary(null, cleanUrl);
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

  if (!hasLibrary()) {
    return <WelcomePage />;
  }

  let { collectionUrl, bookUrl } = props.params;
  collectionUrl = expandCollectionUrl(collectionUrl) || null;
  bookUrl = expandBookUrl(bookUrl) || null;

  let pageTitleTemplate = (collectionTitle, bookTitle) => {
    let details = bookTitle || collectionTitle;
    return title(details);
  };

  const fetcher = new NoCacheDataFetcher({ adapter });
  const actions = new ActionsCreator(fetcher);
  const libraryFn = () => getLibrary(collectionUrl, bookUrl);
  return (
    <LibraryContext.Provider value={libraryFn}>
      <CatalogTabContext.Provider value={props.params.tab}>
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
              router={router}
              pathFor={pathFor}
            />
          </ActionsProvider>
        </div>
      </CatalogTabContext.Provider>
    </LibraryContext.Provider>
  );
}
