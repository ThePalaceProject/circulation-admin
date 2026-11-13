import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import buildStore from "../../../src/store";
import { AdminRoleData } from "../../../src/interfaces";
import { renderWithProviders } from "../testUtils/withProviders";
import { PageContextProvider } from "../../../src/context/pageContext";
import { LegacyRouterContext } from "../../../src/components/LegacyRouterBridge";
import { mockLegacyRouter } from "../testUtils/mockLegacyRouter";
import { BookData } from "@thepalaceproject/web-opds-client/lib/interfaces";

// BookDetailsTabContainer is a connected TabContainer that mounts every one of
// its tab panels on render (the metadata editor, classifications, cover, and
// lists editors), each of which fetches over the network on mount. That
// machinery is incidental to what BookDetailsContainer composes, so mock it to
// a marker that echoes the props it receives and renders the book child it is
// handed. It also reports whether the store it can reach is ours (only our
// store has an `editor` slice). Its button pushes, with the `router` it is
// handed, the path that `pathFor` builds for the "edit" tab.
vi.mock("../../../src/components/BookDetailsTabContainer", async () => {
  const { useStore } =
    await vi.importActual<typeof import("react-redux")>("react-redux");
  const TabContainerMock = (props: any) => (
    <div
      data-testid="book-details-tab-container"
      data-book-url={props.bookUrl}
      data-collection-url={props.collectionUrl}
      data-csrf-token={props.csrfToken}
      data-can-suppress={String(props.canSuppress)}
      data-has-our-store={String(!!useStore().getState().editor)}
      data-library={props.library}
      data-tab={props.tab}
      data-has-refresh-catalog={String(!!props.refreshCatalog)}
    >
      <button
        onClick={() =>
          props.router.push(
            props.pathFor(props.collectionUrl, props.bookUrl, "edit")
          )
        }
      >
        Push edit tab
      </button>
      {props.children}
    </div>
  );
  return { default: TabContainerMock };
});

import BookDetailsContainer from "../../../src/components/BookDetailsContainer";
import BookDetails from "../../../src/components/BookDetails";

const bookData: BookData = {
  id: "book id",
  url: "book url",
  title: "book title",
  raw: { category: [], link: [] },
};

describe("BookDetailsContainer", () => {
  let store;
  let refreshCatalog;

  beforeEach(() => {
    store = buildStore();
    refreshCatalog = vi.fn();
  });

  // As in the catalog, our store is in our store context, and react-redux's
  // Provider holds web-opds-client's catalog store, which has no `editor`
  // slice. As in the catalog page, provide `library` and `tab` through the page
  // context. `renderWithProviders` provides `admin` and `csrfToken` through the
  // app context, and `pathFor` through web-opds-client's context. Provide a
  // mock `router` through `LegacyRouterContext`, as `LegacyRouterBridge` does.
  const catalogStore = configureStore({
    reducer: { catalog: (state = {}) => state },
  });
  const renderContainer = (
    roles: AdminRoleData[] = [{ role: "manager", library: "nypl" }],
    router = mockLegacyRouter()
  ) =>
    renderWithProviders(
      <Provider store={catalogStore}>
        <PageContextProvider value={{ library: "nypl", tab: "edit" }}>
          <LegacyRouterContext.Provider value={router}>
            <BookDetailsContainer
              book={bookData}
              bookUrl="book url"
              collectionUrl="collection url"
              refreshCatalog={refreshCatalog}
            >
              <BookDetails book={bookData} updateBook={vi.fn()} />
            </BookDetailsContainer>
          </LegacyRouterContext.Provider>
        </PageContextProvider>
      </Provider>,
      {
        reduxProviderProps: { store },
        appConfigSettings: { csrfToken: "token", roles },
      }
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
    expect(tabContainer).toHaveAttribute("data-library", "nypl");
    expect(tabContainer).toHaveAttribute("data-tab", "edit");
    // The refreshCatalog callback is not serializable to the DOM, so assert it
    // was passed through.
    expect(tabContainer).toHaveAttribute("data-has-refresh-catalog", "true");
  });

  it("provides the tab container the router and the app's pathFor", async () => {
    const user = userEvent.setup();
    const router = mockLegacyRouter();
    renderContainer(undefined, router);

    // The mock pushes the path that `pathFor` builds for the "edit" tab.
    await user.click(screen.getByRole("button", { name: "Push edit tab" }));

    expect(router.push).toHaveBeenCalledWith(
      "/admin/web/collection/collection%20url/book/book url/tab/edit"
    );
  });

  it.each<{ roles: AdminRoleData[]; canSuppress: string }>([
    { roles: [{ role: "manager", library: "nypl" }], canSuppress: "true" },
    { roles: [{ role: "librarian", library: "nypl" }], canSuppress: "false" },
    { roles: [{ role: "manager", library: "other" }], canSuppress: "false" },
  ])(
    "lets a manager of the book's library suppress it ($roles.0.role of $roles.0.library: $canSuppress)",
    ({ roles, canSuppress }) => {
      renderContainer(roles);
      expect(screen.getByTestId("book-details-tab-container")).toHaveAttribute(
        "data-can-suppress",
        canSuppress
      );
    }
  );

  it("connects the tab container to our store, not the catalog store", () => {
    renderContainer();
    expect(screen.getByTestId("book-details-tab-container")).toHaveAttribute(
      "data-has-our-store",
      "true"
    );
  });
});
