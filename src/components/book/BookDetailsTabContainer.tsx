import * as React from "react";
import { bookMetadataApi } from "../../features/bookMetadata/bookMetadataSlice";
import { connect, ConnectedProps } from "react-redux";
import BookDetailsEditor from "./BookDetailsEditor";
import Classifications from "./Classifications";
import BookCoverEditor from "./BookCoverEditor";
import CustomListsForBook from "../lists/CustomListsForBook";
import { TabContainer, TabContainerProps } from "../shared/TabContainer";
import { RootState } from "../../store";

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

function mapStateToProps(
  state: RootState,
  ownProps: BookDetailsTabContainerOwnProps
) {
  let complaintsCount: number | undefined;
  const complaintsUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/complaints"
    : undefined;
  const complaintsResult = complaintsUrl
    ? bookMetadataApi.endpoints.getComplaints.select(complaintsUrl)(state)
    : undefined;
  if (complaintsResult?.data?.complaints) {
    complaintsCount = Object.values(complaintsResult.data.complaints).reduce(
      (sum, count) => sum + count,
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
  return {
    // "BOOK_CLEAR" is the stable action type from @thepalaceproject/web-opds-client BaseActionCreator
    clearBook: () => dispatch({ type: "BOOK_CLEAR" }),
  };
}

export default connector(BookDetailsTabContainer);
