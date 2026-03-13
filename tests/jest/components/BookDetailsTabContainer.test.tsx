import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import buildStore from "../../../src/store";
import { BookDetailsTabContainer } from "../../../src/components/book/BookDetailsTabContainer";

const store = buildStore();

// Mock the heavy tab content components
jest.mock("../../../src/components/book/BookDetailsEditor", () => {
  const Mock = (props: any) => (
    <div data-testid="book-details-editor" data-book-url={props.bookUrl} />
  );
  Mock.displayName = "MockBookDetailsEditor";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/book/Classifications", () => {
  const Mock = (props: any) => (
    <div data-testid="classifications" data-book-url={props.bookUrl} />
  );
  Mock.displayName = "MockClassifications";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/lists/CustomListsForBook", () => {
  const Mock = (props: any) => (
    <div data-testid="custom-lists-for-book" data-book-url={props.bookUrl} />
  );
  Mock.displayName = "MockCustomListsForBook";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/book/BookCoverEditor", () => {
  const Mock = () => <div data-testid="book-cover-editor" />;
  Mock.displayName = "MockBookCoverEditor";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/book/Complaints", () => {
  const Mock = () => <div data-testid="complaints" />;
  Mock.displayName = "MockComplaints";
  return { __esModule: true, default: Mock };
});

// TabContainer needs router + pathFor via legacy context
class RouterContextProvider extends React.Component<{
  children: React.ReactNode;
}> {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };
  getChildContext() {
    return {
      router: { push: jest.fn(), createHref: () => "test href" },
      pathFor: (collectionUrl: string, bookUrl: string) =>
        `${collectionUrl}::${bookUrl}`,
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

const TEST_BOOK_URL = "book url";
const TEST_COLLECTION_URL = "collection url";

const defaultProps = {
  bookUrl: TEST_BOOK_URL,
  collectionUrl: TEST_COLLECTION_URL,
  csrfToken: "token",
  refreshCatalog: jest.fn().mockResolvedValue(undefined),
  store,
  library: (_a: string, _b: string) => "library",
  canSuppress: true,
  complaintsCount: 0,
  bookData: null,
  clearBook: jest.fn(),
  tab: null,
};

function renderTabs(extraProps = {}) {
  return render(
    <Provider store={store}>
      <RouterContextProvider>
        <BookDetailsTabContainer {...defaultProps} {...extraProps}>
          <div className="bookDetails">Moby Dick</div>
        </BookDetailsTabContainer>
      </RouterContextProvider>
    </Provider>
  );
}

describe("BookDetailsTabContainer", () => {
  it("shows book details children", () => {
    const { container } = renderTabs();
    expect(container.querySelector(".bookDetails")).toBeInTheDocument();
  });

  it("shows Details, Edit, and Classifications tabs", () => {
    const { container } = renderTabs();
    const links = container.querySelectorAll("ul.nav-tabs a");
    const texts = Array.from(links).map((l) => l.textContent);
    expect(texts).toContain("Details");
    expect(texts).toContain("Edit");
    expect(texts).toContain("Classifications");
  });

  it("does not show Cover tab without changeCoverLink", () => {
    const { container } = renderTabs();
    const links = container.querySelectorAll("ul.nav-tabs a");
    const texts = Array.from(links).map((l) => l.textContent);
    expect(texts).not.toContain("Cover");
  });

  it("shows Cover tab when bookData has changeCoverLink", () => {
    const bookData = {
      title: "title",
      changeCoverLink: {
        href: "/change-cover",
        rel: "http://librarysimplified.org/terms/rel/change_cover",
      },
    };
    const { container } = renderTabs({ bookData });
    const links = container.querySelectorAll("ul.nav-tabs a");
    const texts = Array.from(links).map((l) => l.textContent);
    expect(texts).toContain("Cover");
  });
});
