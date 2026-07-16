import * as React from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CustomListEntriesEditor, {
  CustomListEntriesEditorProps,
} from "../../../src/components/CustomListEntriesEditor";

// react-beautiful-dnd does not work in jsdom, so we do not exercise real
// pointer/keyboard drag gestures. Instead we mock the library:
//   - DragDropContext captures the component's onDragStart/onDragEnd handlers so
//     a test can invoke them directly with a synthetic drag "result".
//   - Droppable renders its children render-prop and exposes the `isDropDisabled`
//     prop it received as a DOM data attribute, so the drag-prevention behaviour
//     driven by that prop stays observable.
//   - Draggable simply renders its children render-prop.
type DragResult = {
  draggableId?: string;
  source: { droppableId: string };
  destination?: { droppableId: string };
};

type DndCallbacks = {
  onDragStart: (result: DragResult) => void;
  onDragEnd: (result: DragResult) => void;
};

jest.mock("react-beautiful-dnd", () => ({
  __esModule: true,
  DragDropContext: ({ onDragStart, onDragEnd, children }) => {
    (
      globalThis as typeof globalThis & { __dndCallbacks?: DndCallbacks }
    ).__dndCallbacks = { onDragStart, onDragEnd };
    return children;
  },
  Droppable: ({ droppableId, isDropDisabled, children }) => (
    <div
      data-testid={`droppable-${droppableId}`}
      data-drop-disabled={String(!!isDropDisabled)}
    >
      {children(
        { innerRef: () => undefined, droppableProps: {}, placeholder: null },
        { isDraggingOver: false }
      )}
    </div>
  ),
  Draggable: ({ children }) =>
    children(
      {
        innerRef: () => undefined,
        draggableProps: {},
        dragHandleProps: {},
        draggableStyle: {},
        placeholder: null,
      },
      { isDragging: false }
    ),
}));

// CatalogLink from web-opds-client needs the legacy react-router `pathFor`/
// `router` context to render. The component only distinguishes its links by
// their `bookUrl`/`collectionUrl` props and "View details" text, so mock it to
// a marker that surfaces exactly those. `renderCatalogLink` in the component
// still runs, so its coverage is preserved.
jest.mock(
  "@thepalaceproject/web-opds-client/lib/components/CatalogLink",
  () => ({
    __esModule: true,
    default: ({ bookUrl, collectionUrl, children }) => (
      <div
        data-testid="catalog-link"
        data-book-url={bookUrl}
        data-collection-url={collectionUrl}
      >
        {children}
      </div>
    ),
  })
);

const getDndCallbacks = (): DndCallbacks =>
  (globalThis as typeof globalThis & { __dndCallbacks: DndCallbacks })
    .__dndCallbacks;

describe("CustomListEntriesEditor", () => {
  // The component calls Element.scrollTo on mount/update, which jsdom lacks.
  Element.prototype.scrollTo = () => {};

  let addAllEntries: jest.Mock;
  let addEntry: jest.Mock;
  let deleteAllEntries: jest.Mock;
  let deleteEntry: jest.Mock;
  let loadMoreSearchResults: jest.Mock;
  let loadMoreEntries: jest.Mock;
  let refreshResults: jest.Mock;

  const makeSearchResults = (): any => ({
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    navigationLinks: [],
    books: [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        url: "/some/url1",
        language: "eng",
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
      {
        id: "2",
        title: "result 2",
        authors: ["author 2a", "author 2b"],
        url: "/some/url2",
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
      {
        id: "3",
        title: "result 3",
        authors: ["author 3"],
        url: "/some/url3",
        language: "eng",
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
    ],
  });

  const makeEntries = (): any => [
    {
      id: "A",
      title: "entry A",
      authors: ["author A"],
      url: "/some/urlA",
      raw: {
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      },
    },
    {
      id: "B",
      title: "entry B",
      authors: ["author B1", "author B2"],
      url: "/some/urlB",
      raw: {
        $: {
          "schema:additionalType": { value: "http://bib.schema.org/Audiobook" },
        },
      },
    },
  ];

  type EditorOverrides = Partial<
    Omit<
      CustomListEntriesEditorProps,
      "loadMoreSearchResults" | "loadMoreEntries"
    >
  > & {
    loadMoreSearchResults?: (() => void) | null;
    loadMoreEntries?: (() => void) | null;
  };

  // Builds the element with the always-required props filled in, so each test
  // only supplies what it cares about. Used both for `render` and `rerender`
  // (which replaces, rather than merges, props).
  const editor = (overrides: EditorOverrides = {}) => (
    <CustomListEntriesEditor
      isFetchingMoreCustomListEntries={false}
      isFetchingSearchResults={false}
      isFetchingMoreSearchResults={false}
      loadMoreEntries={loadMoreEntries}
      loadMoreSearchResults={loadMoreSearchResults}
      {...(overrides as Partial<CustomListEntriesEditorProps>)}
    />
  );

  const searchSection = (container: HTMLElement) =>
    container.querySelector(".custom-list-search-results") as HTMLElement;

  const entriesSection = (container: HTMLElement) =>
    container.querySelector(".custom-list-entries") as HTMLElement;

  const entriesHeadingText = (container: HTMLElement) =>
    entriesSection(container).querySelector("h4")?.textContent;

  beforeEach(() => {
    addAllEntries = jest.fn();
    addEntry = jest.fn();
    deleteAllEntries = jest.fn();
    deleteEntry = jest.fn();
    loadMoreSearchResults = jest.fn();
    loadMoreEntries = jest.fn();
    refreshResults = jest.fn();
  });

  afterEach(() => {
    document.body.classList.remove("dragging");
  });

  it("renders search results", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    const section = searchSection(container);
    expect(section).toBeInTheDocument();

    const results = section.querySelectorAll(".search-result");
    expect(results).toHaveLength(3);

    const scoped = within(section);
    expect(scoped.getByText("result 1")).toBeInTheDocument();
    expect(scoped.getByText("author 1")).toBeInTheDocument();
    expect(scoped.getByText("result 2")).toBeInTheDocument();
    expect(scoped.getByText("author 2a, author 2b")).toBeInTheDocument();
    expect(scoped.getByText("result 3")).toBeInTheDocument();
    expect(scoped.getByText("author 3")).toBeInTheDocument();
  });

  it("does not render search results when isOwner is false", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: false,
        searchResults: makeSearchResults(),
      })
    );

    expect(
      container.querySelector(".custom-list-search-results")
    ).not.toBeInTheDocument();
  });

  it("calls refreshResults when the refresh button is clicked", async () => {
    const user = userEvent.setup();
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        refreshResults,
      })
    );

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(refreshResults).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button when isFetchingSearchResults is true", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        refreshResults,
        isFetchingSearchResults: true,
      })
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeDisabled();
  });

  it("enables the refresh button when isFetchingSearchResults is false", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        refreshResults,
        isFetchingSearchResults: false,
      })
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeEnabled();
  });

  it("shows a loading message when isFetchingSearchResults is true", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        refreshResults,
        isFetchingSearchResults: true,
      })
    );

    const loadingIndicator = container.querySelector(".list-loading");
    expect(loadingIndicator).toBeInTheDocument();
    expect(loadingIndicator).toHaveTextContent("Loading");
  });

  it("renders a link to view each search result", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    const links = within(searchSection(container)).getAllByTestId(
      "catalog-link"
    );
    expect(links).toHaveLength(3);

    expect(links[0]).toHaveTextContent("View details");
    expect(links[0]).toHaveAttribute("data-book-url", "/some/url1");
    expect(links[1]).toHaveTextContent("View details");
    expect(links[1]).toHaveAttribute("data-book-url", "/some/url2");
    expect(links[2]).toHaveTextContent("View details");
    expect(links[2]).toHaveAttribute("data-book-url", "/some/url3");
  });

  it("does not include the opds feed url in links to view search results", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        opdsFeedUrl: "opdsFeedUrl",
        searchResults: makeSearchResults(),
      })
    );

    const links = within(searchSection(container)).getAllByTestId(
      "catalog-link"
    );

    links.forEach((link) => {
      expect(link).not.toHaveAttribute("data-collection-url");
    });
  });

  it("renders an SVG icon for each search result", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    const section = searchSection(container);
    expect(section.querySelectorAll(".audio-headphone-icon")).toHaveLength(1);
    expect(section.querySelectorAll(".book-icon")).toHaveLength(2);
  });

  it("doesn't render an SVG icon for books with a bad medium value", () => {
    const searchResults = makeSearchResults();
    searchResults.books[2].raw["$"]["schema:additionalType"].value = "";

    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults,
      })
    );

    const section = searchSection(container);
    expect(section.querySelectorAll(".audio-headphone-icon")).toHaveLength(1);
    expect(section.querySelectorAll(".book-icon")).toHaveLength(1);
  });

  it("renders list entries", () => {
    const { container } = render(
      editor({
        autoUpdate: false,
        entries: makeEntries(),
        isOwner: true,
        entryCount: 2,
      })
    );

    const section = entriesSection(container);
    expect(section).toBeInTheDocument();

    const entries = section.querySelectorAll(".custom-list-entry");
    expect(entries).toHaveLength(2);

    const scoped = within(section);
    expect(scoped.getByText("entry A")).toBeInTheDocument();
    expect(scoped.getByText("author A")).toBeInTheDocument();
    expect(scoped.getByText("entry B")).toBeInTheDocument();
    expect(scoped.getByText("author B1, author B2")).toBeInTheDocument();

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );
  });

  it("makes list entries read only if autoUpdate is true", () => {
    const { container } = render(
      editor({
        autoUpdate: true,
        entries: makeEntries(),
        isOwner: true,
        entryCount: 2,
      })
    );

    const section = entriesSection(container);

    expect(section.querySelectorAll(".droppable-header button")).toHaveLength(
      0
    );
    expect(section.querySelectorAll(".custom-list-entry button")).toHaveLength(
      0
    );
  });

  it("renders an auto update status if autoUpdate is true", () => {
    const base = {
      entries: makeEntries(),
      isOwner: true,
      entryCount: 2,
      autoUpdate: true,
    };

    const { container, rerender } = render(
      editor({ ...base, autoUpdateStatus: "" })
    );

    const statusText = () =>
      container.querySelector(".custom-list-entries .auto-update-status-name")
        ?.textContent;

    expect(statusText()).toBe("Status: New");

    // Without a listId, the status is always "New", even if search is modified.
    rerender(editor({ ...base, autoUpdateStatus: "", isSearchModified: true }));
    expect(statusText()).toBe("Status: New");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: false,
        autoUpdateStatus: "init",
      })
    );
    expect(statusText()).toBe("Status: Initializing");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: true,
        autoUpdateStatus: "init",
      })
    );
    expect(statusText()).toBe("Status: Search criteria modified");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: false,
        autoUpdateStatus: "updated",
      })
    );
    expect(statusText()).toBe("Status: Updated");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: true,
        autoUpdateStatus: "updated",
      })
    );
    expect(statusText()).toBe("Status: Search criteria modified");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: false,
        autoUpdateStatus: "repopulate",
      })
    );
    expect(statusText()).toBe("Status: Repopulating");

    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: true,
        autoUpdateStatus: "repopulate",
      })
    );
    expect(statusText()).toBe("Status: Search criteria modified");

    // A saved list whose autoUpdateStatus is empty is being switched to
    // automatic updates.
    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: false,
        autoUpdateStatus: "",
      })
    );
    expect(statusText()).toBe("Status: Changing to automatic");

    // Any other autoUpdateStatus value is shown verbatim.
    rerender(
      editor({
        ...base,
        listId: "123",
        isSearchModified: false,
        autoUpdateStatus: "some-custom-status",
      })
    );
    expect(statusText()).toBe("Status: some-custom-status");

    rerender(editor({ ...base, autoUpdate: false }));
    expect(
      container.querySelector(".custom-list-entries .auto-update-status-name")
    ).not.toBeInTheDocument();
  });

  it("renders a link to view each entry", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        opdsFeedUrl: "opdsFeedUrl",
        entryCount: 2,
      })
    );

    const links = within(entriesSection(container)).getAllByTestId(
      "catalog-link"
    );
    expect(links).toHaveLength(2);

    expect(links[0]).toHaveTextContent("View details");
    expect(links[0]).toHaveAttribute("data-book-url", "/some/urlA");
    expect(links[1]).toHaveTextContent("View details");
    expect(links[1]).toHaveAttribute("data-book-url", "/some/urlB");
  });

  it("includes the opds feed url in links to view entries", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        opdsFeedUrl: "opdsFeedUrl",
        entryCount: 2,
      })
    );

    const links = within(entriesSection(container)).getAllByTestId(
      "catalog-link"
    );

    expect(links[0]).toHaveAttribute("data-collection-url", "opdsFeedUrl");
    expect(links[1]).toHaveAttribute("data-collection-url", "opdsFeedUrl");
  });

  it("renders an SVG icon for each entry", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        entryCount: 2,
      })
    );

    const section = entriesSection(container);
    expect(section.querySelectorAll(".audio-headphone-icon")).toHaveLength(1);
    expect(section.querySelectorAll(".book-icon")).toHaveLength(1);
  });

  it("doesn't include search results that are already in the entries list when autoUpdate is false", () => {
    const entries = [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
    ];

    const { container } = render(
      editor({
        autoUpdate: false,
        searchResults: makeSearchResults(),
        entries: entries as any,
        isOwner: true,
        entryCount: 2,
      })
    );

    const section = searchSection(container);
    expect(section).toBeInTheDocument();

    const results = section.querySelectorAll(".search-result");
    expect(results).toHaveLength(2);

    const scoped = within(section);
    expect(scoped.getByText("result 2")).toBeInTheDocument();
    expect(scoped.getByText("author 2a, author 2b")).toBeInTheDocument();
    expect(scoped.getByText("result 3")).toBeInTheDocument();
    expect(scoped.getByText("author 3")).toBeInTheDocument();
  });

  it("shows all search results, even ones that are in the entries list, when autoUpdate is true", () => {
    const entries = [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
    ];

    const { container } = render(
      editor({
        autoUpdate: true,
        searchResults: makeSearchResults(),
        entries: entries as any,
        isOwner: true,
        entryCount: 2,
      })
    );

    const section = searchSection(container);
    expect(section).toBeInTheDocument();

    const results = section.querySelectorAll(".search-result");
    expect(results).toHaveLength(3);

    const scoped = within(section);
    expect(scoped.getByText("result 1")).toBeInTheDocument();
    expect(scoped.getByText("author 1")).toBeInTheDocument();
    expect(scoped.getByText("result 2")).toBeInTheDocument();
    expect(scoped.getByText("author 2a, author 2b")).toBeInTheDocument();
    expect(scoped.getByText("result 3")).toBeInTheDocument();
    expect(scoped.getByText("author 3")).toBeInTheDocument();
  });

  // The following drag-and-drop tests invoke the DragDropContext's captured
  // onDragStart/onDragEnd handlers directly with a synthetic drag result, since
  // react-beautiful-dnd cannot perform real drags in jsdom (see the mock above).

  it("prevents dragging within search results", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    // Simulate starting a drag from search results.
    act(() => {
      getDndCallbacks().onDragStart({
        draggableId: "1",
        source: { droppableId: "search-results" },
      });
    });

    // The search-results droppable refuses drops (no reordering within results)...
    expect(screen.getByTestId("droppable-search-results")).toHaveAttribute(
      "data-drop-disabled",
      "true"
    );
    // ...while list entries becomes a valid drop target — which only flips
    // because handleDragStart recorded the drag source (it was disabled before).
    expect(screen.getByTestId("droppable-custom-list-entries")).toHaveAttribute(
      "data-drop-disabled",
      "false"
    );
  });

  it("prevents dragging within list entries", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        entryCount: 2,
      })
    );

    // Simulate starting a drag from list entries.
    act(() => {
      getDndCallbacks().onDragStart({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });

    // List entries refuses drops within itself...
    expect(screen.getByTestId("droppable-custom-list-entries")).toHaveAttribute(
      "data-drop-disabled",
      "true"
    );
    // ...while search results becomes a valid drop target — which only flips
    // because handleDragStart recorded the drag source (it was disabled before).
    expect(screen.getByTestId("droppable-search-results")).toHaveAttribute(
      "data-drop-disabled",
      "false"
    );
  });

  it("calls addEntry when a book is dragged from search results to list entries", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        entryCount: 2,
        addEntry,
      })
    );

    // Simulate starting a drag from search results: the entries droppable now
    // accepts drops.
    act(() => {
      getDndCallbacks().onDragStart({
        draggableId: "1",
        source: { droppableId: "search-results" },
      });
    });

    expect(screen.getByTestId("droppable-custom-list-entries")).toHaveAttribute(
      "data-drop-disabled",
      "false"
    );

    // Simulate dropping on the entries.
    act(() => {
      getDndCallbacks().onDragEnd({
        draggableId: "1",
        source: { droppableId: "search-results" },
        destination: { droppableId: "custom-list-entries" },
      });
    });

    expect(addEntry).toHaveBeenCalledTimes(1);
    expect(addEntry).toHaveBeenCalledWith("1");
  });

  it("shows a message in place of search results when dragging from list entries", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
      })
    );

    // Simulate starting a drag from list entries.
    act(() => {
      getDndCallbacks().onDragStart({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });

    expect(screen.getByTestId("droppable-search-results")).toHaveAttribute(
      "data-drop-disabled",
      "false"
    );
    expect(screen.getByText(/here to remove/)).toBeInTheDocument();

    // If the drop occurs outside a droppable (no destination), the message goes
    // away and the search-results droppable is disabled again.
    act(() => {
      getDndCallbacks().onDragEnd({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });

    expect(screen.getByTestId("droppable-search-results")).toHaveAttribute(
      "data-drop-disabled",
      "true"
    );
    expect(screen.queryByText(/here to remove/)).not.toBeInTheDocument();
  });

  it("calls deleteEntry when a book is dragged from list entries to search results", () => {
    render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        deleteEntry,
      })
    );

    // Simulate starting a drag from list entries: the search-results droppable
    // now accepts drops (to remove).
    act(() => {
      getDndCallbacks().onDragStart({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });

    expect(screen.getByTestId("droppable-search-results")).toHaveAttribute(
      "data-drop-disabled",
      "false"
    );

    // Simulate dropping on the search results.
    act(() => {
      getDndCallbacks().onDragEnd({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
        destination: { droppableId: "search-results" },
      });
    });

    expect(deleteEntry).toHaveBeenCalledTimes(1);
    expect(deleteEntry).toHaveBeenCalledWith("A");
  });

  it("calls addEntry when the Add to List button is clicked on a search result", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        entryCount: 2,
        addEntry,
      })
    );

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const addButtons = within(searchSection(container)).getAllByRole("button", {
      name: /Add to list/,
    });

    await user.click(addButtons[0]);

    expect(addEntry).toHaveBeenCalledTimes(1);
    expect(addEntry).toHaveBeenCalledWith("1");
  });

  it("hides the Add to List buttons when autoUpdate is true", () => {
    const { container } = render(
      editor({
        autoUpdate: true,
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        entryCount: 2,
        addEntry,
      })
    );

    expect(
      within(searchSection(container)).queryByRole("button", {
        name: /Add to list/,
      })
    ).not.toBeInTheDocument();
  });

  it("calls deleteEntry when the Remove from List button is clicked on a list entry", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        entryCount: 2,
        deleteEntry,
      })
    );

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const deleteButtons = within(entriesSection(container)).getAllByRole(
      "button",
      { name: /Remove from list/ }
    );

    await user.click(deleteButtons[0]);

    expect(deleteEntry).toHaveBeenCalledTimes(1);
    expect(deleteEntry).toHaveBeenCalledWith("A");
  });

  it("does not render Remove from List buttons on a list entries when isOwner is false", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: false,
        searchResults: makeSearchResults(),
        entryCount: 2,
        deleteEntry,
      })
    );

    expect(
      entriesSection(container).querySelectorAll(".links button")
    ).toHaveLength(0);
  });

  it("does not render the Add All to List button when there are no search results", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
      })
    );

    expect(container.querySelector(".add-all-button")).not.toBeInTheDocument();
  });

  it("does not render the Add All to List button when autoUpdate is true", () => {
    const { container } = render(
      editor({
        autoUpdate: true,
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    expect(container.querySelector(".add-all-button")).not.toBeInTheDocument();
  });

  it("does not render the Add All to List button when isOwner is false", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: false,
        searchResults: makeSearchResults(),
      })
    );

    expect(container.querySelector(".add-all-button")).not.toBeInTheDocument();
  });

  it("calls addAllEntries when the Add All to List button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        entryCount: 2,
        addAllEntries,
      })
    );

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    await user.click(screen.getByRole("button", { name: /Add all to list/ }));

    expect(addAllEntries).toHaveBeenCalledTimes(1);
  });

  it("does not render the Delete all button when there are no entries", () => {
    const { container } = render(
      editor({
        entries: [],
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    expect(
      container.querySelector(".delete-all-button")
    ).not.toBeInTheDocument();
  });

  it("does not render the Delete all button when isOwner is false", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: false,
        searchResults: makeSearchResults(),
      })
    );

    expect(
      container.querySelector(".delete-all-button")
    ).not.toBeInTheDocument();
  });

  it("calls deleteAllEntries when the Delete all button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        entryCount: 2,
        deleteAllEntries,
      })
    );

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteAllEntries).toHaveBeenCalledTimes(1);
  });

  it("hides the Load More button in search results when loadMoreSearchResults is null", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        loadMoreSearchResults: null,
      })
    );

    expect(
      searchSection(container).querySelector(".load-more-button")
    ).not.toBeInTheDocument();
  });

  it("hides the Load More button in search results when isFetchingSearchResults is true", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        isFetchingSearchResults: true,
      })
    );

    expect(
      searchSection(container).querySelector(".load-more-button")
    ).not.toBeInTheDocument();
  });

  it("hides Load More button in list entries when loadMoreEntries is null", () => {
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        loadMoreEntries: null,
      })
    );

    expect(
      entriesSection(container).querySelector(".load-more-button")
    ).not.toBeInTheDocument();
  });

  it("disables the Load More button when loading more search results", () => {
    const { container, rerender } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    let button = searchSection(container).querySelector(".load-more-button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    rerender(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
        isFetchingMoreSearchResults: true,
      })
    );

    button = searchSection(container).querySelector(".load-more-button");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("disables the Load More button when loading more list entries", () => {
    const { container, rerender } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
      })
    );

    let button = entriesSection(container).querySelector(".load-more-button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    rerender(
      editor({
        entries: makeEntries(),
        isOwner: true,
        isFetchingMoreCustomListEntries: true,
      })
    );

    button = entriesSection(container).querySelector(".load-more-button");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("calls loadMoreSearchResults when the Load More button is clicked in search results", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults: makeSearchResults(),
      })
    );

    await user.click(
      searchSection(container).querySelector(".load-more-button") as HTMLElement
    );

    expect(loadMoreSearchResults).toHaveBeenCalledTimes(1);
  });

  it("calls loadMoreEntries when the Load More button is clicked in list entries", async () => {
    const user = userEvent.setup();
    const { container } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
      })
    );

    await user.click(
      entriesSection(container).querySelector(
        ".load-more-button"
      ) as HTMLElement
    );

    expect(loadMoreEntries).toHaveBeenCalledTimes(1);
  });

  it("should properly display the count of list entries", () => {
    const searchResults = makeSearchResults();

    const { container, rerender } = render(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults,
        entryCount: 2,
      })
    );

    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    rerender(
      editor({
        entries: makeEntries().slice(0, 1),
        isOwner: true,
        searchResults,
        entryCount: 1,
      })
    );
    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 1 of 1 book"
    );

    rerender(
      editor({
        entries: [],
        isOwner: true,
        searchResults,
        entryCount: 0,
      })
    );
    expect(entriesHeadingText(container)).toBe(
      "List Entries: No books in this list"
    );

    rerender(
      editor({
        entries: [],
        isOwner: true,
        searchResults,
        entryCount: 12,
      })
    );
    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 0 - 0 of 12 books"
    );

    rerender(
      editor({
        entries: makeEntries(),
        isOwner: true,
        searchResults,
        entryCount: 12,
      })
    );
    expect(entriesHeadingText(container)).toBe(
      "List Entries: Displaying 1 - 2 of 12 books"
    );
  });
});
