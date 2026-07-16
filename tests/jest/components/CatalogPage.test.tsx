import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import title from "../../../src/utils/title";

// CatalogPage does `require("@thepalaceproject/web-opds-client")` and mounts the OPDS
// Web Client, a heavy third-party render target that fetches on mount. Replace it
// with a marker that echoes the props CatalogPage hands it and the legacy
// `tab`/`library` child context CatalogPage supplies (read via `contextTypes`), so
// we can assert the wiring without the real catalog.
jest.mock("@thepalaceproject/web-opds-client", () => {
  const React = require("react");
  const PropTypes = require("prop-types");
  const OPDSCatalogMock = (props, context) => (
    <div
      data-testid="opds-catalog"
      data-collection-url={props.collectionUrl}
      data-book-url={props.bookUrl}
      data-tab={context.tab}
      data-library={context.library && context.library()}
      data-header-name={props.Header && props.Header.name}
      data-book-details-container-name={
        props.BookDetailsContainer && props.BookDetailsContainer.name
      }
      data-has-compute-breadcrumbs={String(!!props.computeBreadcrumbs)}
      data-title-book={
        props.pageTitleTemplate && props.pageTitleTemplate("Collection", "Book")
      }
      data-title-collection={
        props.pageTitleTemplate && props.pageTitleTemplate("Collection", null)
      }
    />
  );
  OPDSCatalogMock.contextTypes = {
    tab: PropTypes.string,
    library: PropTypes.func,
  };
  return OPDSCatalogMock;
});

// When there is no library, CatalogPage renders WelcomePage, which mounts the real
// Header — that needs react-router v3 context and fetches on mount. Mock Header to a
// marker so the WelcomePage path stays self-contained.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: function Header() {
    return <div data-testid="header" />;
  },
}));

import CatalogPage from "../../../src/components/CatalogPage";
import Header from "../../../src/components/Header";
import BookDetailsContainer from "../../../src/components/BookDetailsContainer";

// The unit env has no `global.jsdom`, so compute the expected URLs from the real
// origin.
const origin = window.location.origin;

describe("CatalogPage", () => {
  const baseParams = {
    collectionUrl: "library/collectionurl",
    bookUrl: "library/bookurl",
    tab: "tab",
  };

  it("renders the OPDS catalog with expanded collection and book URLs", () => {
    renderWithProviders(<CatalogPage params={baseParams} />);

    const catalog = screen.getByTestId("opds-catalog");
    expect(catalog).toHaveAttribute(
      "data-collection-url",
      `${origin}/library/collectionurl`
    );
    expect(catalog).toHaveAttribute(
      "data-book-url",
      `${origin}/library/works/bookurl`
    );
  });

  it("forwards the admin header, book details container, breadcrumbs, and page-title template", () => {
    renderWithProviders(<CatalogPage params={baseParams} />);

    const catalog = screen.getByTestId("opds-catalog");
    expect(catalog).toHaveAttribute("data-header-name", Header.name);
    expect(catalog).toHaveAttribute(
      "data-book-details-container-name",
      BookDetailsContainer.name
    );
    expect(catalog).toHaveAttribute("data-has-compute-breadcrumbs", "true");
    // pageTitleTemplate prefers the book title over the collection title.
    expect(catalog).toHaveAttribute("data-title-book", title("Book"));
    expect(catalog).toHaveAttribute(
      "data-title-collection",
      title("Collection")
    );
  });

  it("expands a collection URL that already contains a query string", () => {
    renderWithProviders(
      <CatalogPage
        params={{
          ...baseParams,
          collectionUrl: "library/collectionurl?samplequery=test",
        }}
      />
    );

    expect(screen.getByTestId("opds-catalog")).toHaveAttribute(
      "data-collection-url",
      `${origin}/library/collectionurl?samplequery=test`
    );
  });

  it("puts the tab into the child context", () => {
    renderWithProviders(<CatalogPage params={baseParams} />);
    expect(screen.getByTestId("opds-catalog")).toHaveAttribute(
      "data-tab",
      "tab"
    );
  });

  it("derives the child-context library from the collection URL", () => {
    renderWithProviders(<CatalogPage params={baseParams} />);
    expect(screen.getByTestId("opds-catalog")).toHaveAttribute(
      "data-library",
      "library"
    );
  });

  it("derives the child-context library from the book URL when there is no collection URL", () => {
    renderWithProviders(
      <CatalogPage params={{ ...baseParams, collectionUrl: null }} />
    );
    expect(screen.getByTestId("opds-catalog")).toHaveAttribute(
      "data-library",
      "library"
    );
  });

  it("renders the welcome page when there is no library", () => {
    renderWithProviders(
      <CatalogPage params={{ collectionUrl: null, bookUrl: null, tab: null }} />
    );

    expect(screen.queryByTestId("opds-catalog")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Welcome to the Circulation Admin Interface!/)
    ).toBeInTheDocument();
  });

  it("renders the footer", () => {
    const { container } = renderWithProviders(
      <CatalogPage params={baseParams} />
    );
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
