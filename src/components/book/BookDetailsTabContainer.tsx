import * as React from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useGetComplaintsQuery } from "../../features/bookMetadata/bookMetadataSlice";
import BookDetailsEditor from "./BookDetailsEditor";
import Classifications from "./Classifications";
import BookCoverEditor from "./BookCoverEditor";
import CustomListsForBook from "../lists/CustomListsForBook";
import { TabContainer, TabContainerProps } from "../shared/TabContainer";
import { RootState } from "../../store";
import { BookData } from "../../interfaces";
import { withRoutingContext } from "../../utils/withRoutingContext";

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

interface BookDetailsTabContainerConnectedProps {
  complaintsCount?: number;
  bookData?: BookData;
  clearBook?: () => void;
}

export type BookDetailsTabContainerProps = BookDetailsTabContainerConnectedProps &
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
    tabs["details"] = (
      <div className="details-tab-content">{this.props.children}</div>
    );
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
    if (this.props.router && this.props.pathFor) {
      this.props.router.push(
        this.props.pathFor(this.props.collectionUrl, this.props.bookUrl, tab)
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

function BookDetailsTabContainerData(
  ownProps: BookDetailsTabContainerOwnProps
) {
  const dispatch = useDispatch();
  const bookData = useSelector((state: RootState) => state.bookEditor?.data);
  const complaintsUrl = ownProps.bookUrl
    ? ownProps.bookUrl.replace("works", "admin/works") + "/complaints"
    : undefined;
  const { data: complaintsData } = useGetComplaintsQuery(complaintsUrl, {
    skip: !complaintsUrl,
  });
  const complaintsCount = complaintsData?.complaints
    ? Object.values(complaintsData.complaints).reduce(
        (sum, count) => sum + count,
        0
      )
    : undefined;
  const Inner = BookDetailsTabContainer as any;
  return (
    <Inner
      {...ownProps}
      complaintsCount={complaintsCount}
      bookData={bookData}
      clearBook={() => dispatch({ type: "BOOK_CLEAR" })}
    />
  );
}

function BookDetailsTabContainerWithData(
  ownProps: BookDetailsTabContainerOwnProps
) {
  if (!ownProps.store) {
    return <BookDetailsTabContainerData {...ownProps} />;
  }

  // Force this subtree to use the admin editor store, not OPDS's internal store.
  return (
    <Provider store={ownProps.store}>
      <BookDetailsTabContainerData {...ownProps} />
    </Provider>
  );
}

export default withRoutingContext(BookDetailsTabContainerWithData as any);
