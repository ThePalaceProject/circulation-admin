import * as React from "react";
import editorAdapter from "../editorAdapter";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { connect, ConnectedProps } from "react-redux";
import BookDetailsEditor from "./BookDetailsEditor";
import Classifications from "./Classifications";
import BookCoverEditor from "./BookCoverEditor";
import CustomListsForBook from "./CustomListsForBook";
import { TabContainer, TabContainerProps } from "./TabContainer";
import { RootState } from "../store";
import Admin from "../models/Admin";

interface BookDetailsTabContainerOwnProps extends TabContainerProps {
  bookUrl: string;
  collectionUrl: string;
  refreshCatalog: () => Promise<any>;
  library: (collectionUrl, bookUrl) => string;
  canSuppress: boolean;
  // extended from TabContainerProps in superclass
  //   store?: Store<RootState>;
  //   csrfToken?: string;
  //   tab: string;
  //   class?: string;
  // from store
  //   bookData?: BookData;
  //   complaintsCount?: number;
  // dispatch actions
  //   clearBook?: () => void;
}

const connectOptions = { pure: true };
const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  connectOptions
);
export type BookDetailsTabContainerProps = ConnectedProps<typeof connector> &
  BookDetailsTabContainerOwnProps;

/** Wraps the book details component from OPDSWebClient with additional tabs
    for editing metadata, classifications, and complaints. */
export class BookDetailsTabContainer extends TabContainer<
  BookDetailsTabContainerProps
> {
  componentWillUnmount() {
    this.props.clearBook();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.bookUrl !== this.props.bookUrl) {
      this.props.clearBook();
    }
  }

  tabs() {
    const tabs = {};
    tabs["details"] = <div>{this.props.children}</div>;
    tabs["edit"] = (
      <BookDetailsEditor
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        refreshCatalog={this.props.refreshCatalog}
        canSuppress={this.props.canSuppress}
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
    tabs["lists"] = (
      <CustomListsForBook
        store={this.props.store}
        csrfToken={this.props.csrfToken}
        bookUrl={this.props.bookUrl}
        book={this.props.bookData}
        refreshCatalog={this.props.refreshCatalog}
        library={this.props.library(
          this.props.collectionUrl,
          this.props.bookUrl
        )}
      />
    );
    return tabs;
  }

  handleSelect(event) {
    const tab = event.target.dataset.tabkey;
    if (this.context.router) {
      this.context.router.push(
        this.context.pathFor(this.props.collectionUrl, this.props.bookUrl, tab)
      );
    }
  }

  defaultTab() {
    return "details";
  }

  tabDisplayName(name: string) {
    let capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    if (
      name === "complaints" &&
      typeof this.props.complaintsCount !== "undefined"
    ) {
      capitalized += " (" + this.props.complaintsCount + ")";
    }
    return capitalized;
  }
}

function mapStateToProps(state: RootState) {
  let complaintsCount: number | undefined;

  if (state.editor.complaints.data) {
    complaintsCount = Object.keys(state.editor.complaints.data).reduce(
      (result, type) => {
        return result + state.editor.complaints.data[type];
      },
      0
    );
  } else {
    complaintsCount = undefined;
  }

  return {
    complaintsCount: complaintsCount,
    bookData: state.bookEditor.data,
  };
}

function mapDispatchToProps(dispatch) {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher);
  return {
    clearBook: () => dispatch(actions.clearBook()),
  };
}

export default connector(BookDetailsTabContainer);
