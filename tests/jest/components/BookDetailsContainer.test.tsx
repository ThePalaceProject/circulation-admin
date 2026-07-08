import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen } from "@testing-library/react";

import buildStore from "../../../src/store";
import { BookData } from "@thepalaceproject/web-opds-client/lib/interfaces";

// BookDetailsTabContainer is a connected TabContainer that mounts every one of its
// tab panels on render (the metadata editor, classifications, cover, and lists
// editors), each of which fetches over the network on mount. That machinery is
// incidental to what BookDetailsContainer composes, so mock it to a marker that
// echoes the props it receives and renders the book child it is handed.
jest.mock("../../../src/components/BookDetailsTabContainer", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="book-details-tab-container"
      data-book-url={props.bookUrl}
      data-collection-url={props.collectionUrl}
      data-csrf-token={props.csrfToken}
      data-has-store={String(!!props.store)}
      data-has-library={String(!!props.library)}
      data-has-refresh-catalog={String(!!props.refreshCatalog)}
    >
      {props.children}
    </div>
  ),
}));

import BookDetailsContainer from "../../../src/components/BookDetailsContainer";
import BookDetails from "../../../src/components/BookDetails";

// BookDetailsContainer reads its configuration from the legacy React context that
// the OPDS web client supplies in production. `renderWithProviders` does not supply
// the `library` (nor `tab`) keys it reads, so wrap it in a small legacy context
// provider that hands it everything it needs.
class LegacyContextProvider extends React.Component<{ context: any }> {
  static childContextTypes = {
    editorStore: PropTypes.object,
    csrfToken: PropTypes.string,
    tab: PropTypes.string,
    library: PropTypes.func,
    admin: PropTypes.object,
  };
  getChildContext() {
    return this.props.context;
  }
  render() {
    return this.props.children;
  }
}

const bookData: BookData = {
  id: "book id",
  url: "book url",
  title: "book title",
  raw: { category: [], link: [] },
};

describe("BookDetailsContainer", () => {
  let store;
  let context;
  let refreshCatalog;

  beforeEach(() => {
    store = buildStore();
    refreshCatalog = jest.fn();
    context = {
      editorStore: store,
      csrfToken: "token",
      library: jest.fn(),
      admin: { isLibraryManager: () => true },
    };
  });

  const renderContainer = () =>
    render(
      <LegacyContextProvider context={context}>
        <BookDetailsContainer
          book={bookData}
          bookUrl="book url"
          collectionUrl="collection url"
          refreshCatalog={refreshCatalog}
        >
          <BookDetails book={bookData} updateBook={jest.fn()} />
        </BookDetailsContainer>
      </LegacyContextProvider>
    );

  it("renders BookDetails with its child's props", () => {
    renderContainer();
    // The container recreates the real BookDetails from the child element's props,
    // so the book it was handed shows up (its title is rendered as the heading).
    expect(
      screen.getByRole("heading", { name: "book title" })
    ).toBeInTheDocument();
  });

  it("shows a tab container with initial tab", () => {
    renderContainer();
    const tabContainer = screen.getByTestId("book-details-tab-container");
    expect(tabContainer).toBeInTheDocument();
    expect(tabContainer).toHaveAttribute("data-book-url", "book url");
    expect(tabContainer).toHaveAttribute(
      "data-collection-url",
      "collection url"
    );
    expect(tabContainer).toHaveAttribute("data-csrf-token", "token");
    // The library function, redux store, and refreshCatalog callback are forwarded
    // from context/props; they are not serializable to the DOM, so assert they were
    // passed through.
    expect(tabContainer).toHaveAttribute("data-has-store", "true");
    expect(tabContainer).toHaveAttribute("data-has-library", "true");
    expect(tabContainer).toHaveAttribute("data-has-refresh-catalog", "true");
  });
});
