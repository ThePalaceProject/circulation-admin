import * as React from "react";
import editorAdapter from "../editorAdapter";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { connect } from "react-redux";
import BookDetailsEditor from "./BookDetailsEditor";
import Classifications from "./Classifications";
import BookCoverEditor from "./BookCoverEditor";
import Complaints from "./Complaints";
import CustomListsForBook from "./CustomListsForBook";
import { BookData } from "../interfaces";
import { TabContainer, TabContainerProps } from "./TabContainer";

export interface BookDetailsTabContainerProps extends TabContainerProps {
  bookUrl: string;
  bookData?: BookData;
  collectionUrl: string;
  refreshCatalog: () => Promise<any>;
  complaintsCount?: number;
  clearBook?: () => void;
  library: (collectionUrl, bookUrl) => string;
}

/** Wraps the book details component from OPDSWebClient with additional tabs
    for editing metadata, classifications, and complaints. */
export class BookDetailsTabContainer extends TabContainer<BookDetailsTabContainerProps> {

  componentWillUnmount() {
    this.props.clearBook();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.bookUrl !== this.props.bookUrl) {
      this.props.clearBook();
    }
  }

  tabs() {
    const tabs = {};
    tabs["details"] = (
      <div className="details">
        { this.props.children }
      </div>
    );
    tabs["edit"] = (
      <BookDetailsEditor
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        refreshCatalog={this.props.refreshCatalog}
        />
    );
    tabs["classifications"] = (
      <Classifications
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        book={this.props.bookData}
        refreshCatalog={this.props.refreshCatalog}
        />
    );
    if (this.props.bookData && this.props.bookData.changeCoverLink) {
      tabs["cover"] = (
        <BookCoverEditor
          store={this.props.store}
          csrfToken={this.props.csrfToken}
          bookUrl={this.props.bookUrl}
          book={this.props.bookData}
          refreshCatalog={this.props.refreshCatalog}
          />
      );
    }
    tabs["complaints"] = (
      <Complaints
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        book={this.props.bookData}
        refreshCatalog={this.props.refreshCatalog}
        />
    );
    tabs["lists"] = (
      <CustomListsForBook
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        book={this.props.bookData}
        refreshCatalog={this.props.refreshCatalog}
        library={this.props.library(this.props.collectionUrl, this.props.bookUrl)}
        />
    );
    return tabs;
  }

  handleSelect(event) {
    let tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push(this.context.pathFor(this.props.collectionUrl, this.props.bookUrl, tab));
    }
  }

  defaultTab() {
    return "details";
  }

  tabDisplayName(name) {
    let capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    if (name === "complaints" && typeof this.props.complaintsCount !== "undefined") {
      capitalized += " (" + this.props.complaintsCount + ")";
    }
    return capitalized;
  };
}

function mapStateToProps(state, ownProps) {
  let complaintsCount;

  if (state.editor.complaints.data) {
    complaintsCount = Object.keys(state.editor.complaints.data).reduce((result, type) => {
      return result + state.editor.complaints.data[type];
    }, 0);
  } else {
    complaintsCount = undefined;
  }

  return {
    complaintsCount: complaintsCount,
    bookData: state.editor.book.data
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher({ adapter: editorAdapter });
  let actions = new ActionCreator(fetcher);
  return {
    clearBook: () => dispatch(actions.clearBook())
  };
}

let connectOptions = { withRef: true, pure: true };
const ConnectedBookDetailsTabContainer = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  connectOptions
)(BookDetailsTabContainer);

export default ConnectedBookDetailsTabContainer;
