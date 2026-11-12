import * as React from "react";
import * as PropTypes from "prop-types";

import Admin from "../models/Admin";
import BookDetailsTabContainer from "./BookDetailsTabContainer";
import BookDetails from "./BookDetails";
import { AppReduxProvider } from "../context/appStoreContext";
import { BookDetailsContainerProps } from "@thepalaceproject/web-opds-client/lib/components/Root";

export interface BookDetailsContainerContext {
  admin: Admin;
  csrfToken: string;
  tab: string;
  library: (collectionUrl: string, bookUrl: string) => string;
}

const BookDetailsContainer = (
  props: React.PropsWithChildren<BookDetailsContainerProps>,
  context: BookDetailsContainerContext
) => {
  const child = React.Children.only(
    props.children
  ) as React.ReactElement<BookDetails>;
  const book = React.createElement(BookDetails, child.props);

  // Where react-redux's context holds another store (as in web-opds-client's
  // catalog), the tabs still connect to our store. Everything under
  // `AppReduxProvider` reads our store, including the book details child, so
  // do not put a part that needs the catalog store there.
  return (
    <div className="book-details-container">
      <AppReduxProvider>
        <BookDetailsTabContainer
          class="book-details-tab-container"
          tab={context.tab}
          bookUrl={props.bookUrl}
          collectionUrl={props.collectionUrl}
          refreshCatalog={props.refreshCatalog}
          library={context.library}
          csrfToken={context.csrfToken}
          canSuppress={context.admin.isLibraryManager(
            context.library(props.collectionUrl, props.bookUrl)
          )}
        >
          {book}
        </BookDetailsTabContainer>
      </AppReduxProvider>
    </div>
  );
};
BookDetailsContainer.contextTypes = {
  admin: PropTypes.object.isRequired,
  csrfToken: PropTypes.string.isRequired,
  tab: PropTypes.string,
  library: PropTypes.func.isRequired,
};

export default BookDetailsContainer;
