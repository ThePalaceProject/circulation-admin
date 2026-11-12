import * as React from "react";

import BookDetailsTabContainer from "./BookDetailsTabContainer";
import BookDetails from "./BookDetails";
import { AppReduxProvider } from "../context/appStoreContext";
import { useAppContext } from "../context/appContext";
import { usePageLibrary, usePageTab } from "../context/pageContext";
import { BookDetailsContainerProps } from "@thepalaceproject/web-opds-client/lib/components/Root";

const BookDetailsContainer = (
  props: React.PropsWithChildren<BookDetailsContainerProps>
) => {
  const child = React.Children.only(
    props.children
  ) as React.ReactElement<BookDetails>;
  const book = React.createElement(BookDetails, child.props);
  const { admin, csrfToken } = useAppContext();
  const library = usePageLibrary();
  const tab = usePageTab();

  // Where react-redux's context holds another store (as in web-opds-client's
  // catalog), the tabs still connect to our store. Everything under
  // `AppReduxProvider` reads our store, including the book details child, so
  // do not put a part that needs the catalog store there.
  return (
    <div className="book-details-container">
      <AppReduxProvider>
        <BookDetailsTabContainer
          class="book-details-tab-container"
          tab={tab}
          bookUrl={props.bookUrl}
          collectionUrl={props.collectionUrl}
          refreshCatalog={props.refreshCatalog}
          library={library}
          csrfToken={csrfToken}
          canSuppress={admin.isLibraryManager(library)}
        >
          {book}
        </BookDetailsTabContainer>
      </AppReduxProvider>
    </div>
  );
};

export default BookDetailsContainer;
