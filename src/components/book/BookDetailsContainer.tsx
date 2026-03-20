import * as React from "react";
import BookDetailsTabContainer from "./BookDetailsTabContainer";
import BookDetails from "./BookDetails";
import { BookDetailsContainerProps } from "@thepalaceproject/web-opds-client/lib/components/Root";
import { useAppAdmin, useCsrfToken, useEditorStore } from "../../context/appContext";
import { useLibrary } from "../../context/LibraryContext";
import { useCatalogTab } from "../../context/CatalogTabContext";

const BookDetailsContainer = (
  props: BookDetailsContainerProps
) => {
  const admin = useAppAdmin();
  const csrfToken = useCsrfToken();
  const editorStore = useEditorStore();
  const tab = useCatalogTab();
  const library = useLibrary();

  const child = React.Children.only(props.children) as React.ReactElement<
    BookDetails
  >;
  const book = React.createElement(BookDetails, child.props);

  const libraryFn =
    library ||
    ((collectionUrl: string, bookUrl: string) => {
      if (collectionUrl) {
        return collectionUrl.split("/")[0];
      }
      if (bookUrl) {
        return bookUrl.split("/")[0];
      }
      return undefined;
    });
  const libraryShortName = libraryFn(props.collectionUrl, props.bookUrl);

  return (
    <div className="book-details-container">
      <BookDetailsTabContainer
        className="book-details-tab-container"
        tab={tab || "details"}
        bookUrl={props.bookUrl}
        collectionUrl={props.collectionUrl}
        refreshCatalog={props.refreshCatalog}
        library={libraryFn}
        csrfToken={csrfToken}
        store={editorStore}
        canSuppress={admin.isLibraryManager(libraryShortName)}
      >
        {book}
      </BookDetailsTabContainer>
    </div>
  );
};

export default BookDetailsContainer;
