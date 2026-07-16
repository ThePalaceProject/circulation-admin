import * as React from "react";
import * as PropTypes from "prop-types";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";
import { getBookData } from "../../../src/features/book/bookEditorSlice";

// Each tab panel is a connected component that fetches over the network on mount.
// This container's behavior is the tab SET, tab SWITCHING, and clearing book data,
// not the panels' internals, so mock each panel to a marker that echoes the props
// the legacy test asserted.
jest.mock("../../../src/components/BookDetailsEditor", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="book-details-editor"
      data-csrf-token={props.csrfToken}
      data-book-url={props.bookUrl}
    />
  ),
}));
jest.mock("../../../src/components/Classifications", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="classifications" data-book-url={props.bookUrl} />
  ),
}));
jest.mock("../../../src/components/CustomListsForBook", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="custom-lists-for-book"
      data-book-url={props.bookUrl}
      data-library={props.library}
    />
  ),
}));
jest.mock("../../../src/components/BookCoverEditor", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="book-cover-editor" data-book-url={props.bookUrl} />
  ),
}));

import BookDetailsTabContainerConnected, {
  BookDetailsTabContainer,
} from "../../../src/components/BookDetailsTabContainer";

// The container reads `router` and `pathFor` from the legacy React context the
// app supplies in production. Wrap it in a small provider that hands it those.
class LegacyContextProvider extends React.Component<{ context: any }> {
  static childContextTypes = {
    router: PropTypes.object,
    pathFor: PropTypes.func,
  };
  getChildContext() {
    return this.props.context;
  }
  render() {
    return this.props.children;
  }
}

const TEST_BOOK_URL = "book url";
const TEST_COLLECTION_URL = "collection url";

describe("BookDetailsTabContainer", () => {
  const pathFor = (collectionUrl: string, bookUrl: string, tab?: string) =>
    `${collectionUrl}::${bookUrl}::${tab}`;

  type Overrides = {
    bookData?: any;
    bookUrl?: string;
    clearBook?: jest.Mock;
    push?: jest.Mock;
  };

  const renderContainer = (overrides: Overrides = {}) => {
    const push = overrides.push || jest.fn();
    const clearBook = overrides.clearBook || jest.fn();
    const context = { router: { push }, pathFor };
    // One store for the lifetime of the render: a fresh one per element() call
    // would hand the panels a new store identity on every rerender.
    const store = buildStore();
    const element = (bookUrl: string, bookData: any) => (
      <LegacyContextProvider context={context}>
        <BookDetailsTabContainer
          bookUrl={bookUrl}
          collectionUrl={TEST_COLLECTION_URL}
          csrfToken="token"
          refreshCatalog={jest.fn()}
          store={store}
          library={() => "library"}
          canSuppress={true}
          complaintsCount={0}
          bookData={bookData}
          clearBook={clearBook}
          tab={null}
        >
          <div className="bookDetails">Moby Dick</div>
        </BookDetailsTabContainer>
      </LegacyContextProvider>
    );
    const result = render(
      element(overrides.bookUrl ?? TEST_BOOK_URL, overrides.bookData ?? null)
    );
    const rerenderWith = (bookUrl: string, bookData: any = null) =>
      result.rerender(element(bookUrl, bookData));
    return { ...result, push, clearBook, rerenderWith };
  };

  it("shows book details", () => {
    renderContainer();
    expect(screen.getByText("Moby Dick")).toBeInTheDocument();
  });

  it("shows details, edit, and classifications tabs", () => {
    renderContainer();
    for (const name of ["Details", "Edit", "Classifications"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("only shows cover tab when the book data has a change cover link", () => {
    const { rerenderWith } = renderContainer();
    expect(
      screen.queryByRole("link", { name: "Cover" })
    ).not.toBeInTheDocument();

    rerenderWith(TEST_BOOK_URL, {
      title: "title",
      changeCoverLink: {
        href: "/change-cover",
        rel: "http://librarysimplified.org/terms/rel/change_cover",
      },
    });
    expect(screen.getByRole("link", { name: "Cover" })).toBeInTheDocument();
  });

  it("shows editor", () => {
    renderContainer();
    const editor = screen.getByTestId("book-details-editor");
    expect(editor).toHaveAttribute("data-csrf-token", "token");
    expect(editor).toHaveAttribute("data-book-url", TEST_BOOK_URL);
  });

  it("shows classifications", () => {
    renderContainer();
    expect(screen.getByTestId("classifications")).toHaveAttribute(
      "data-book-url",
      TEST_BOOK_URL
    );
  });

  it("shows lists", () => {
    renderContainer();
    const lists = screen.getByTestId("custom-lists-for-book");
    expect(lists).toHaveAttribute("data-book-url", TEST_BOOK_URL);
    expect(lists).toHaveAttribute("data-library", "library");
  });

  it("uses router to navigate when tab is clicked", async () => {
    const { push } = renderContainer();
    await userEvent.click(screen.getByRole("link", { name: "Edit" }));
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      pathFor(TEST_COLLECTION_URL, TEST_BOOK_URL, "edit")
    );
  });

  it("clears book data when receiving new book url", () => {
    const clearBook = jest.fn();
    const { rerenderWith } = renderContainer({ clearBook });
    rerenderWith("new book url");
    expect(clearBook).toHaveBeenCalledTimes(1);
  });

  it("clears book data on unmount", () => {
    const clearBook = jest.fn();
    const { unmount } = renderContainer({ clearBook });
    unmount();
    expect(clearBook).toHaveBeenCalledTimes(1);
  });

  // Render the CONNECTED default export so mapStateToProps / mapDispatchToProps
  // (which run only when the connected component mounts) are exercised.
  const renderConnected = (store = buildStore()) =>
    render(
      <Provider store={store}>
        <LegacyContextProvider
          context={{ router: { push: jest.fn() }, pathFor }}
        >
          <BookDetailsTabContainerConnected
            bookUrl={TEST_BOOK_URL}
            collectionUrl={TEST_COLLECTION_URL}
            csrfToken="token"
            refreshCatalog={jest.fn()}
            library={() => "library"}
            canSuppress={true}
            tab={null}
          >
            <div className="bookDetails">Moby Dick</div>
          </BookDetailsTabContainerConnected>
        </LegacyContextProvider>
      </Provider>
    );

  it("wires up store and dispatch when connected", () => {
    renderConnected();
    expect(screen.getByRole("link", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByText("Moby Dick")).toBeInTheDocument();
  });

  it("takes book data from the store when connected", () => {
    const store = buildStore();
    store.dispatch(
      getBookData.fulfilled(
        {
          title: "title",
          changeCoverLink: {
            href: "/change-cover",
            rel: "http://librarysimplified.org/terms/rel/change_cover",
          },
        } as any,
        "request-id",
        { url: TEST_BOOK_URL } as any
      )
    );
    renderConnected(store);
    // The cover tab appears only when bookData carries a changeCoverLink, so it
    // is the observable proof that mapStateToProps threaded the store's book
    // data into the container.
    expect(screen.getByRole("link", { name: "Cover" })).toBeInTheDocument();
  });
});
