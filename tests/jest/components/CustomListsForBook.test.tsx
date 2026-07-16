import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";

// CustomListsForBook renders a react-router v3 <Link> for which
// renderWithProviders supplies no router context. Mock it to a marker that
// exposes the `to` pathname and state so the destination can be asserted.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props: any) => (
    <div
      data-testid="Link"
      data-pathname={
        typeof props.to === "string" ? props.to : props.to?.pathname
      }
      data-book-title={
        typeof props.to === "object" ? props.to?.state?.bookTitle : undefined
      }
    >
      {props.children}
    </div>
  ),
}));

// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised. The book's lists and all available lists are fetched on mount
// and fed back in through the Redux store; book/bookUrl/library/refreshCatalog
// are own props.
import CustomListsForBook, {
  CustomListsForBook as UnconnectedCustomListsForBook,
} from "../../../src/components/CustomListsForBook";

const allCustomLists = [
  { id: "1", name: "list 1", is_owner: true, is_shared: false },
  { id: "2", name: "list 2", is_owner: true, is_shared: false },
  { id: "3", name: "list 3", is_owner: true, is_shared: false },
];
const listsForBook = [
  { id: "2", name: "list 2", is_owner: true, is_shared: false },
];

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

// Serves the "all custom lists" endpoint and the per-book "/lists" endpoint from
// the supplied fixtures; answers POSTs (edit) with success.
const stubFetch = (allLists: unknown[], forBook: unknown[]) =>
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (url, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return new Response("success", { status: 200 });
      }
      const u = String(url);
      if (u.includes("custom_lists")) {
        return jsonResponse({ custom_lists: allLists });
      }
      return jsonResponse({ custom_lists: forBook });
    });

const renderConnected = () => {
  const store = buildStore();
  const refreshCatalog = jest.fn().mockResolvedValue(undefined);
  const result = renderWithProviders(
    <CustomListsForBook
      csrfToken="token"
      book={{ id: "id", title: "test title" } as any}
      bookUrl="works/book url"
      library="library"
      refreshCatalog={refreshCatalog}
    />,
    { reduxProviderProps: { store } }
  );
  return { ...result, refreshCatalog };
};

describe("CustomListsForBook", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the book title and the book's current lists", async () => {
    stubFetch(allCustomLists, listsForBook);
    const { container } = renderConnected();

    expect(
      await screen.findByRole("heading", { level: 2, name: "test title" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Current Lists" })
    ).toBeInTheDocument();

    const link = await screen.findByRole("link", { name: "list 2" });
    expect(link).toHaveAttribute("href", "/admin/web/lists/library/edit/2");
    // Exactly one current list is shown.
    expect(container.querySelectorAll(".with-remove-button")).toHaveLength(1);
  });

  it("builds the current-list URL from the list's id, not its name", async () => {
    // A list named "new" whose id is "42" proves the URL uses the id.
    const newList = { id: "42", name: "new", is_owner: true, is_shared: false };
    stubFetch([...allCustomLists, newList], [newList]);
    renderConnected();

    const link = await screen.findByRole("link", { name: "new" });
    expect(link).toHaveAttribute("href", "/admin/web/lists/library/edit/42");
  });

  it("shows a menu of the lists the book is not yet on", async () => {
    stubFetch(allCustomLists, listsForBook);
    const { container } = renderConnected();

    await screen.findByRole("link", { name: "list 2" });

    const select = container.querySelector("select");
    expect(select).not.toBeNull();
    const optionValues = Array.from(select.querySelectorAll("option")).map(
      (o) => o.getAttribute("value")
    );
    // "list 2" is excluded because the book is already on it.
    expect(optionValues).toStrictEqual(["list 1", "list 3"]);
    expect(screen.getByText(/Select an existing list/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("shows placeholder text when the book is not on any list", async () => {
    stubFetch(allCustomLists, []);
    const { container } = renderConnected();

    expect(
      await screen.findByText("This book is not currently on any lists.")
    ).toBeInTheDocument();
    // With no current lists there is no "Current Lists" heading.
    expect(
      screen.queryByRole("heading", { name: "Current Lists" })
    ).not.toBeInTheDocument();
    expect(container.querySelector(".with-remove-button")).toBeNull();
  });

  it("hides the menu once the book is on every available list", async () => {
    stubFetch(allCustomLists, allCustomLists);
    const { container } = renderConnected();

    expect(
      await screen.findByText(
        "This book has been added to all the available lists."
      )
    ).toBeInTheDocument();
    expect(container.querySelector("select")).toBeNull();
  });

  it("shows a message instead of the input list when no lists exist", async () => {
    stubFetch([], []);
    renderConnected();

    expect(
      await screen.findByText("There are no available lists.")
    ).toBeInTheDocument();
  });

  it("shows a link to the list creator that carries the book title", async () => {
    stubFetch(allCustomLists, listsForBook);
    renderConnected();

    await screen.findByRole("link", { name: "list 2" });

    const creatorLink = screen.getByTestId("Link");
    expect(creatorLink).toHaveTextContent("Create a new list");
    expect(creatorLink).toHaveAttribute(
      "data-pathname",
      "/admin/web/lists/library/create"
    );
    expect(creatorLink).toHaveAttribute("data-book-title", "test title");
    expect(
      screen.getByText(
        "(The book title will be automatically copied and searched on the list creator page.)"
      )
    ).toBeInTheDocument();
  });

  it("fetches the book's lists and all custom lists on mount, without refreshing the catalog", async () => {
    const fetchSpy = stubFetch(allCustomLists, listsForBook);
    const { refreshCatalog } = renderConnected();

    await screen.findByRole("link", { name: "list 2" });

    const urls = fetchSpy.mock.calls.map(([u]) => String(u));
    expect(urls).toContain("admin/works/book url/lists");
    expect(urls.some((u) => u.includes("custom_lists"))).toBe(true);
    expect(refreshCatalog).not.toHaveBeenCalled();
  });

  it("does not re-fetch all custom lists on mount when they are already loaded", () => {
    // The mount guard (CustomListsForBook.tsx:158) fetches the full list of
    // custom lists only when they are not already present; the book's own lists
    // are still fetched. Drive the already-loaded case through the unconnected
    // class, since the connected mount always starts from an empty store.
    const fetchAllCustomLists = jest.fn();
    const fetchCustomListsForBook = jest.fn();
    render(
      <UnconnectedCustomListsForBook
        csrfToken="token"
        book={{ id: "id", title: "test title" } as any}
        bookUrl="works/book url"
        library="library"
        refreshCatalog={jest.fn().mockResolvedValue(undefined)}
        allCustomLists={allCustomLists as any}
        customListsForBook={listsForBook as any}
        fetchAllCustomLists={fetchAllCustomLists}
        fetchCustomListsForBook={fetchCustomListsForBook}
        editCustomListsForBook={jest.fn().mockResolvedValue(undefined)}
      />
    );

    expect(fetchCustomListsForBook).toHaveBeenCalledTimes(1);
    expect(fetchAllCustomLists).not.toHaveBeenCalled();
  });

  it("adds a list and posts the updated set of lists", async () => {
    const user = userEvent.setup();
    const fetchSpy = stubFetch(allCustomLists, listsForBook);
    const { container, refreshCatalog } = renderConnected();

    await screen.findByRole("link", { name: "list 2" });

    await user.selectOptions(
      container.querySelector("select") as HTMLSelectElement,
      "list 1"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(refreshCatalog).toHaveBeenCalled());

    const postCall = fetchSpy.mock.calls.find(
      ([, opts]) => (opts as RequestInit)?.method === "POST"
    );
    expect(String(postCall[0])).toBe("admin/works/book url/lists");
    const lists = JSON.parse(
      ((postCall[1] as RequestInit).body as FormData).get("lists") as string
    );
    expect(lists).toStrictEqual([
      { id: "2", name: "list 2", is_owner: true, is_shared: false },
      { id: "1", name: "list 1", is_owner: true, is_shared: false },
    ]);
  });

  it("removes a list and posts the emptied set of lists", async () => {
    const user = userEvent.setup();
    const fetchSpy = stubFetch(allCustomLists, listsForBook);
    const { refreshCatalog } = renderConnected();

    await screen.findByRole("link", { name: "list 2" });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(refreshCatalog).toHaveBeenCalled());

    const postCall = fetchSpy.mock.calls.find(
      ([, opts]) => (opts as RequestInit)?.method === "POST"
    );
    expect(String(postCall[0])).toBe("admin/works/book url/lists");
    const lists = JSON.parse(
      ((postCall[1] as RequestInit).body as FormData).get("lists") as string
    );
    expect(lists).toStrictEqual([]);
  });

  it("shows an error message", () => {
    // A mount-time fetch failure would reject the (uncaught) fetch promise and
    // crash the worker, so drive the error through the prop connect derives.
    render(
      <UnconnectedCustomListsForBook
        csrfToken="token"
        book={{ id: "id", title: "test title" } as any}
        bookUrl="works/book url"
        library="library"
        refreshCatalog={jest.fn().mockResolvedValue(undefined)}
        allCustomLists={allCustomLists as any}
        customListsForBook={listsForBook as any}
        fetchAllCustomLists={jest.fn()}
        fetchCustomListsForBook={jest.fn()}
        editCustomListsForBook={jest.fn().mockResolvedValue(undefined)}
        fetchError={{ status: 400, response: "boom", url: "" } as any}
      />
    );
    expect(screen.getByText(/Error: boom/)).toBeInTheDocument();
  });

  it("disables the remove and add controls while fetching", () => {
    // isFetching is a connect-derived prop; inject it via the unconnected class.
    render(
      <UnconnectedCustomListsForBook
        csrfToken="token"
        book={{ id: "id", title: "test title" } as any}
        bookUrl="works/book url"
        library="library"
        refreshCatalog={jest.fn().mockResolvedValue(undefined)}
        allCustomLists={allCustomLists as any}
        customListsForBook={listsForBook as any}
        fetchAllCustomLists={jest.fn()}
        fetchCustomListsForBook={jest.fn()}
        editCustomListsForBook={jest.fn().mockResolvedValue(undefined)}
        isFetching={true}
      />
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("resyncs its lists when the book url changes", () => {
    const commonProps = {
      csrfToken: "token",
      library: "library",
      refreshCatalog: jest.fn().mockResolvedValue(undefined),
      allCustomLists: allCustomLists as any,
      fetchAllCustomLists: jest.fn(),
      fetchCustomListsForBook: jest.fn(),
      editCustomListsForBook: jest.fn().mockResolvedValue(undefined),
    };
    const { rerender } = render(
      <UnconnectedCustomListsForBook
        {...commonProps}
        book={{ id: "a", title: "Book A" } as any}
        bookUrl="works/book-a"
        customListsForBook={listsForBook as any}
      />
    );
    // list 2 (the book's only list) is in the current column.
    expect(screen.getByText("list 2")).toBeInTheDocument();

    // A new book url re-syncs the current lists from the new customListsForBook.
    rerender(
      <UnconnectedCustomListsForBook
        {...commonProps}
        book={{ id: "b", title: "Book B" } as any}
        bookUrl="works/book-b"
        customListsForBook={[allCustomLists[0]] as any}
      />
    );
    expect(screen.getByText("list 1")).toBeInTheDocument();
  });
});
