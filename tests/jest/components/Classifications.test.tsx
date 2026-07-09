import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import genreData from "../../../src/components/__tests__/genreData";
import classificationsData from "../../../src/components/__tests__/classificationsData";
// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised. The genre tree and classifications are fetched on mount and fed
// back in through the Redux store; `book` and `refreshCatalog` are own props.
import Classifications, {
  Classifications as UnconnectedClassifications,
} from "../../../src/components/Classifications";

// A `targetAgeRange` is required: ClassificationsForm reads it in bookChanged on
// re-render (the legacy enzyme test used shallow, so the child never re-rendered).
const bookData = {
  title: "title",
  fiction: true,
  categories: ["Space Opera"],
  targetAgeRange: [null, null],
};
const bookUrl = "works/1234";
const classificationsUrl = "admin/works/1234/classifications";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

// Resolves each fetch with the appropriate body based on the request URL/method.
const stubFetch = () =>
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (url, opts?: RequestInit) => {
      const u = String(url);
      if (opts?.method === "POST") {
        return new Response("success", { status: 200 });
      }
      if (u === "/admin/genres") {
        return jsonResponse(genreData);
      }
      if (u.endsWith("/classifications")) {
        return jsonResponse({ classifications: classificationsData });
      }
      // getBookData (OPDS) on refresh — non-OPDS body so it settles quietly.
      return new Response("{}", { status: 200 });
    });

const renderConnected = (
  overrides: Partial<{ refreshCatalog: () => Promise<any> }> = {}
) => {
  const store = buildStore();
  const refreshCatalog =
    overrides.refreshCatalog ?? jest.fn().mockResolvedValue(undefined);
  const result = renderWithProviders(
    <Classifications
      store={store}
      csrfToken="token"
      bookUrl={bookUrl}
      book={bookData as any}
      refreshCatalog={refreshCatalog}
    />,
    { reduxProviderProps: { store } }
  );
  return { ...result, refreshCatalog };
};

describe("Classifications", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the book title", async () => {
    stubFetch();
    renderConnected();
    expect(
      await screen.findByRole("heading", { level: 2, name: "title" })
    ).toBeInTheDocument();
  });

  it("shows the updating indicator while fetching", () => {
    // A never-resolving fetch keeps the panel in its fetching state.
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => new Promise(() => {}));
    const { container } = renderConnected();
    expect(container.querySelector(".updating-loader")).toBeInTheDocument();
  });

  it("shows the classifications form and table once the data loads, and hides the updating indicator", async () => {
    stubFetch();
    const { container } = renderConnected();

    // The form renders once the genre tree loads.
    expect(
      await screen.findByRole("button", { name: "Save" })
    ).toBeInTheDocument();
    // The table renders once the classifications load.
    expect(
      screen.getByRole("heading", { name: "Related Classifications" })
    ).toBeInTheDocument();
    // A sample classification from the fixture shows in the table.
    expect(screen.getByText("FICTION / Ghost")).toBeInTheDocument();
    // Fetching is done, so the updating indicator is gone.
    expect(container.querySelector(".updating-loader")).not.toBeInTheDocument();
  });

  it("shows a fetch error", () => {
    // A network failure on mount would reject the (uncaught) fetch promise and
    // crash the worker, so drive the error through the prop that connect derives.
    render(
      <UnconnectedClassifications
        store={buildStore() as any}
        csrfToken="token"
        bookUrl={bookUrl}
        book={bookData as any}
        refreshCatalog={jest.fn().mockResolvedValue(undefined)}
        bookAdminUrl="book admin url"
        fetchError={{ status: 500, url: "url", response: "response" } as any}
        fetchGenreTree={jest.fn()}
        fetchClassifications={jest.fn()}
        fetchBook={jest.fn()}
        editClassifications={jest.fn().mockResolvedValue(undefined)}
        genreTree={null}
        classifications={null}
        isFetching={false}
      />
    );
    expect(screen.getByText(/Error: response/)).toBeInTheDocument();
  });

  it("fetches the genre tree and classifications on mount", async () => {
    const fetchSpy = stubFetch();
    renderConnected();
    await screen.findByRole("button", { name: "Save" });

    const urls = fetchSpy.mock.calls.map(([u]) => String(u));
    expect(urls).toContain("/admin/genres");
    expect(urls).toContain(classificationsUrl);
  });

  it("refreshes the book, classifications, and catalog after editing classifications", async () => {
    const user = userEvent.setup();
    const fetchSpy = stubFetch();
    const { container, refreshCatalog } = renderConnected();

    await screen.findByRole("button", { name: "Save" });

    // The form requires an audience selection before it will submit.
    await user.selectOptions(
      container.querySelector('select[name="audience"]') as HTMLSelectElement,
      "Adult"
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Editing POSTs the edit_classifications URL, then refreshes the catalog.
    await waitFor(() => expect(refreshCatalog).toHaveBeenCalledTimes(1));
    const postCall = fetchSpy.mock.calls.find(
      ([, opts]) => (opts as RequestInit)?.method === "POST"
    );
    expect(String(postCall[0])).toBe("admin/works/1234/edit_classifications");
  });
});
