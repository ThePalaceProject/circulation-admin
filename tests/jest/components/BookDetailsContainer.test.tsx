import * as React from "react";
import * as PropTypes from "prop-types";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../src/store";
import BookDetailsContainer from "../../../src/components/book/BookDetailsContainer";
import ContextProvider from "../../../src/components/layout/ContextProvider";

const bookData = {
  id: "book id",
  url: "book url",
  title: "book title",
};

const refreshCatalog = jest.fn();

jest.mock("../../../src/components/book/BookDetailsTabContainer", () => {
  const MockTab = (props: any) => (
    <div
      data-testid="book-details-tab-container"
      data-book-url={props.bookUrl}
      data-collection-url={props.collectionUrl}
    >
      {props.children}
    </div>
  );
  MockTab.displayName = "MockBookDetailsTabContainer";
  return { __esModule: true, default: MockTab };
});

jest.mock("../../../src/components/book/BookDetails", () => {
  const MockBookDetails = (props: any) => (
    <div data-testid="book-details" data-book-id={props.book?.id} />
  );
  MockBookDetails.displayName = "MockBookDetails";
  return { __esModule: true, default: MockBookDetails };
});

// BookDetailsContainer needs a 'library' function via legacy context — provide it via a wrapper
class LibraryContextProvider extends React.Component<{
  children: React.ReactNode;
}> {
  static childContextTypes = {
    library: PropTypes.func.isRequired,
  };
  getChildContext() {
    return { library: (_collectionUrl: string, _bookUrl: string) => "testlib" };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

function renderWithFullContext(ui: React.ReactElement) {
  return render(
    <Provider store={store}>
      <ContextProvider config={{ csrfToken: "token" }}>
        <LibraryContextProvider>{ui}</LibraryContextProvider>
      </ContextProvider>
    </Provider>
  );
}

describe("BookDetailsContainer", () => {
  it("renders a book-details-container", () => {
    const { container } = renderWithFullContext(
      <BookDetailsContainer
        book={bookData}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={refreshCatalog}
      >
        <div data-child />
      </BookDetailsContainer>
    );
    expect(
      container.querySelector(".book-details-container")
    ).toBeInTheDocument();
  });

  it("renders the tab container with correct props", () => {
    const { getByTestId } = renderWithFullContext(
      <BookDetailsContainer
        book={bookData}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={refreshCatalog}
      >
        <div data-child />
      </BookDetailsContainer>
    );
    const tabContainer = getByTestId("book-details-tab-container");
    expect(tabContainer).toBeInTheDocument();
    expect(tabContainer.getAttribute("data-book-url")).toBe("book url");
    expect(tabContainer.getAttribute("data-collection-url")).toBe(
      "collection url"
    );
  });
});
