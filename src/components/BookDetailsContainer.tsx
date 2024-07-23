import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import * as PropTypes from "prop-types";

import Admin from "../models/Admin";
import BookDetailsTabContainer from "./BookDetailsTabContainer";
import BookDetails from "./BookDetails";
import { BookDetailsContainerProps } from "@thepalaceproject/web-opds-client/lib/components/Root";
import { RootState } from "../store";

export interface BookDetailsContainerContext {
  admin: Admin;
  csrfToken: string;
  tab: string;
  editorStore: Store<RootState>;
  library: (collectionUrl: string, bookUrl: string) => string;
}

const BookDetailsContainer = (
  props: BookDetailsContainerProps,
  context: BookDetailsContainerContext
) => {
  const child = React.Children.only(props.children) as React.ReactElement<
    BookDetails
  >;
  const book = React.createElement(BookDetails, child.props);

  return (
    <div className="book-details-container">
      <BookDetailsTabContainer
        class="book-details-tab-container"
        tab={context.tab}
        bookUrl={props.bookUrl}
        collectionUrl={props.collectionUrl}
        refreshCatalog={props.refreshCatalog}
        library={context.library}
        csrfToken={context.csrfToken}
        store={context.editorStore}
        canSuppress={context.admin.isLibraryManager(
          context.library(props.collectionUrl, props.bookUrl)
        )}
      >
        {book}
      </BookDetailsTabContainer>
    </div>
  );
};
BookDetailsContainer.contextTypes = {
  admin: PropTypes.object.isRequired,
  csrfToken: PropTypes.string.isRequired,
  tab: PropTypes.string,
  editorStore: PropTypes.object.isRequired,
  library: PropTypes.func.isRequired,
};

export default BookDetailsContainer;
