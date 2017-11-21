import * as React from "react";
import { Store } from "redux";
import BookDetailsTabContainer from "./BookDetailsTabContainer";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";
import { Navigate } from "../interfaces";
import { State } from "../reducers/index";

export interface BookDetailsContainerContext {
  csrfToken: string;
  tab: string;
  editorStore: Store<State>;
}

/** Wrapper for `BookDetailsTabContainer` that extracts parameters from its context
    and converts them into props. This component is passed into the OPDSCatalog from
    opds-web-client to replace the body of the book details page. */
export default class BookDetailsContainer extends React.Component<BookDetailsContainerProps, void> {
  context: BookDetailsContainerContext;

  static contextTypes = {
    csrfToken: React.PropTypes.string.isRequired,
    tab: React.PropTypes.string,
    editorStore: React.PropTypes.object.isRequired
  };

  render(): JSX.Element {
    return (
      <div className="book-details-container">
        <BookDetailsTabContainer
          bookUrl={this.props.bookUrl}
          collectionUrl={this.props.collectionUrl}
          refreshCatalog={this.props.refreshCatalog}
          tab={this.context.tab}
          store={this.context.editorStore}
          csrfToken={this.context.csrfToken}>
          { this.props.children }
        </BookDetailsTabContainer>
      </div>
    );
  }
}