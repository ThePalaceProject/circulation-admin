import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import genreData from "../fixtures/genreData";
import classificationsData from "../fixtures/classificationsData";
import { setupMswServer } from "../testUtils/mswServer";
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
  const { server, requests } = setupMswServer(
    http.get("*/admin/genres", () => HttpResponse.json(genreData)),
    http.get(`*/${classificationsUrl}`, () =>
      HttpResponse.json({ classifications: classificationsData })
    ),
    http.post("*/admin/works/1234/edit_classifications", () =>
      HttpResponse.text("success")
    )
  );

  it("shows the book title", async () => {
    renderConnected();
    expect(
      await screen.findByRole("heading", { level: 2, name: "title" })
    ).toBeInTheDocument();
  });

  it("shows the updating indicator while fetching", () => {
    // A never-resolving response keeps the panel in its fetching state.
    server.use(
      http.get("*", async () => {
        await delay("infinite");
      })
    );
    const { container } = renderConnected();
    expect(container.querySelector(".updating-loader")).toBeInTheDocument();
  });

  it("shows the classifications form and table once the data loads, and hides the updating indicator", async () => {
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
    renderConnected();
    await screen.findByRole("button", { name: "Save" });

    const paths = requests.map((r) => new URL(r.url).pathname);
    expect(paths).toContain("/admin/genres");
    expect(paths).toContain(`/${classificationsUrl}`);
  });

  it("refreshes the book, classifications, and catalog after editing classifications", async () => {
    const user = userEvent.setup();
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
    const postRequest = requests.find((r) => r.method === "POST");
    expect(new URL(postRequest.url).pathname).toBe(
      "/admin/works/1234/edit_classifications"
    );
  });
});
