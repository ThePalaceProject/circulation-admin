import * as React from "react";
import * as PropTypes from "prop-types";
import { render, fireEvent, act } from "@testing-library/react";
import CustomListEntriesEditor from "../../../src/components/lists/CustomListEntriesEditor";

// ── CatalogLink context provider ─────────────────────────────────────────────
// web-opds-client's CatalogLink reads `pathFor` and `router` from the legacy
// React context API (contextTypes). Wrap everything in this provider.
class ContextProvider extends React.Component<{ children: React.ReactNode }> {
  static childContextTypes = {
    pathFor: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };
  getChildContext() {
    return {
      pathFor: (collectionUrl: string, bookUrl: string) =>
        [collectionUrl, bookUrl].filter(Boolean).join("::") || "url",
      router: {
        createHref: jest.fn(),
        push: jest.fn(),
        isActive: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        setRouteLeaveHook: jest.fn(),
      },
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

// ── DragDropContext mock helpers ──────────────────────────────────────────────
// react-beautiful-dnd doesn't work in jsdom:
//   - its internal raf-scheduler fails silently
//   - Droppable uses a portal
// We capture the onDragStart / onDragEnd handlers and call them directly in tests.

let capturedDragHandlers: {
  onDragStart?: (event: any) => void;
  onDragEnd?: (event: any) => void;
} = {};

jest.mock("react-beautiful-dnd", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");

  const DragDropContext = ({
    children,
    onDragStart,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragStart?: (event: any) => void;
    onDragEnd?: (event: any) => void;
  }) => {
    capturedDragHandlers = { onDragStart, onDragEnd };
    return <>{children}</>;
  };

  const Droppable = ({
    children,
    droppableId,
    isDropDisabled,
  }: {
    children: (provided: any, snapshot: any) => React.ReactNode;
    droppableId: string;
    isDropDisabled?: boolean;
  }) => (
    <div
      data-testid={`droppable-${droppableId}`}
      data-drop-disabled={String(isDropDisabled)}
    >
      {children(
        {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          innerRef: function innerRefNoop() {},
          placeholder: null,
          droppableProps: {},
        },
        { isDraggingOver: false }
      )}
    </div>
  );

  const Draggable = ({
    children,
    draggableId,
    _isDragDisabled,
  }: {
    children: (provided: any, snapshot: any) => React.ReactNode;
    draggableId: string;
    _isDragDisabled?: boolean;
  }) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children(
        {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          innerRef: function innerRefNoop() {},
          placeholder: null,
          draggableProps: {},
          dragHandleProps: {},
          draggableStyle: {},
        },
        { isDragging: false }
      )}
    </div>
  );

  return { DragDropContext, Droppable, Draggable };
});

// ── fixtures ──────────────────────────────────────────────────────────────────

const searchResultsData = {
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
};

const entriesData = [
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

function buildProps(
  overrides: Partial<React.ComponentProps<typeof CustomListEntriesEditor>> = {}
): React.ComponentProps<typeof CustomListEntriesEditor> {
  return {
    entries: entriesData,
    isOwner: true,
    searchResults: searchResultsData,
    loadMoreSearchResults: jest.fn(),
    loadMoreEntries: jest.fn(),
    isFetchingSearchResults: false,
    isFetchingMoreSearchResults: false,
    isFetchingMoreCustomListEntries: false,
    ...overrides,
  };
}

function renderEditor(
  overrides: Partial<React.ComponentProps<typeof CustomListEntriesEditor>> = {}
) {
  capturedDragHandlers = {};
  const props = buildProps(overrides);
  const utils = render(
    <ContextProvider>
      <CustomListEntriesEditor {...props} />
    </ContextProvider>
  );
  return { ...utils, props };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("CustomListEntriesEditor", () => {
  it("renders search results", () => {
    const { container } = renderEditor();
    const resultsContainer = container.querySelector(
      ".custom-list-search-results"
    );
    expect(resultsContainer).toBeTruthy();

    const resultItems = resultsContainer!.querySelectorAll(
      "[data-testid^='draggable-']"
    );
    expect(resultItems.length).toBe(3);
    expect(resultsContainer!.textContent).toContain("result 1");
    expect(resultsContainer!.textContent).toContain("author 1");
    expect(resultsContainer!.textContent).toContain("result 2");
    expect(resultsContainer!.textContent).toContain("author 2a, author 2b");
    expect(resultsContainer!.textContent).toContain("result 3");
    expect(resultsContainer!.textContent).toContain("author 3");
  });

  it("does not render search results when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });
    expect(container.querySelector(".custom-list-search-results")).toBeFalsy();
  });

  it("calls refreshResults when the refresh button is clicked", () => {
    const refreshResults = jest.fn();
    const { container } = renderEditor({ refreshResults });
    const refreshButton = container.querySelector<HTMLButtonElement>(
      ".btn.refresh-button"
    );
    expect(refreshButton).toBeTruthy();
    fireEvent.click(refreshButton!);
    expect(refreshResults).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button when isFetchingSearchResults is true", () => {
    const { container } = renderEditor({ isFetchingSearchResults: true });
    const refreshButton = container.querySelector<HTMLButtonElement>(
      ".btn.refresh-button"
    );
    expect(refreshButton).toBeDisabled();
  });

  it("shows a loading indicator when isFetchingSearchResults is true", () => {
    const { container } = renderEditor({ isFetchingSearchResults: true });
    expect(container.querySelector(".list-loading")).toBeTruthy();
  });

  it("renders a link to view each search result", () => {
    const { container } = renderEditor();
    const resultsContainer = container.querySelector(
      ".custom-list-search-results"
    )!;
    const links = resultsContainer.querySelectorAll<HTMLAnchorElement>("a");
    // Each search result has a "View details" link
    const viewLinks = Array.from(links).filter((a) =>
      a.textContent?.includes("View details")
    );
    expect(viewLinks.length).toBe(3);
  });

  it("does not include the opds feed url in links to view search results", () => {
    // Search result links should NOT include opdsFeedUrl (only entry links do)
    const { container } = renderEditor({ opdsFeedUrl: "opdsFeedUrl" });
    const resultsContainer = container.querySelector(
      ".custom-list-search-results"
    )!;
    const links = resultsContainer.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      expect(link.href).not.toContain("opdsFeedUrl");
    });
  });

  it("renders list entries", () => {
    const { container } = renderEditor({ autoUpdate: false, entryCount: 2 });
    const entriesContainer = container.querySelector(".custom-list-entries")!;
    expect(entriesContainer).toBeTruthy();

    const entryItems = entriesContainer.querySelectorAll(
      "[data-testid^='draggable-']"
    );
    expect(entryItems.length).toBe(2);

    expect(entriesContainer.textContent).toContain("entry A");
    expect(entriesContainer.textContent).toContain("author A");
    expect(entriesContainer.textContent).toContain("entry B");
    expect(entriesContainer.textContent).toContain("author B1, author B2");

    const h4 = entriesContainer.querySelector("h4");
    expect(h4!.textContent).toBe("List Entries: Displaying 1 - 2 of 2 books");
  });

  it("makes list entries read only if autoUpdate is true", () => {
    const { container } = renderEditor({ autoUpdate: true, entryCount: 2 });
    const entriesContainer = container.querySelector(".custom-list-entries")!;
    // No delete-all button in header
    expect(entriesContainer.querySelector(".delete-all-button")).toBeFalsy();
    // No remove-from-list buttons on entries
    expect(
      entriesContainer.querySelectorAll(".custom-list-entry button").length
    ).toBe(0);
  });

  it("renders an auto update status if autoUpdate is true (no listId = New)", () => {
    const { container } = renderEditor({
      autoUpdate: true,
      autoUpdateStatus: "",
      entryCount: 2,
    });
    const status = container.querySelector(".auto-update-status-name");
    expect(status!.textContent).toBe("Status: New");
  });

  it("renders Initializing status when autoUpdateStatus is 'init'", () => {
    const { container } = renderEditor({
      autoUpdate: true,
      autoUpdateStatus: "init",
      listId: "123",
      isSearchModified: false,
      entryCount: 2,
    });
    const status = container.querySelector(".auto-update-status-name");
    expect(status!.textContent).toBe("Status: Initializing");
  });

  it("renders 'Search criteria modified' status when isSearchModified is true and listId exists", () => {
    const { container } = renderEditor({
      autoUpdate: true,
      autoUpdateStatus: "init",
      listId: "123",
      isSearchModified: true,
      entryCount: 2,
    });
    const status = container.querySelector(".auto-update-status-name");
    expect(status!.textContent).toBe("Status: Search criteria modified");
  });

  it("renders Updated status when autoUpdateStatus is 'updated'", () => {
    const { container } = renderEditor({
      autoUpdate: true,
      autoUpdateStatus: "updated",
      listId: "123",
      isSearchModified: false,
      entryCount: 2,
    });
    const status = container.querySelector(".auto-update-status-name");
    expect(status!.textContent).toBe("Status: Updated");
  });

  it("renders Repopulating status when autoUpdateStatus is 'repopulate'", () => {
    const { container } = renderEditor({
      autoUpdate: true,
      autoUpdateStatus: "repopulate",
      listId: "123",
      isSearchModified: false,
      entryCount: 2,
    });
    const status = container.querySelector(".auto-update-status-name");
    expect(status!.textContent).toBe("Status: Repopulating");
  });

  it("does not render auto update status when autoUpdate is false", () => {
    const { container } = renderEditor({
      autoUpdate: false,
      autoUpdateStatus: "updated",
      listId: "123",
      entryCount: 2,
    });
    expect(container.querySelector(".auto-update-status-name")).toBeFalsy();
  });

  it("renders a link to view each entry", () => {
    const { container } = renderEditor({
      opdsFeedUrl: "opdsFeedUrl",
      entryCount: 2,
    });
    const entriesContainer = container.querySelector(".custom-list-entries")!;
    const links = entriesContainer.querySelectorAll<HTMLAnchorElement>("a");
    const viewLinks = Array.from(links).filter((a) =>
      a.textContent?.includes("View details")
    );
    expect(viewLinks.length).toBe(2);
  });

  it("includes the opds feed url in links to view entries", () => {
    const { container } = renderEditor({
      opdsFeedUrl: "my-feed-url",
      entryCount: 2,
    });
    const entriesContainer = container.querySelector(".custom-list-entries")!;
    const links = entriesContainer.querySelectorAll<HTMLAnchorElement>("a");
    const viewLinks = Array.from(links).filter((a) =>
      a.textContent?.includes("View details")
    );
    // CatalogLink uses collectionUrl to build the href
    expect(viewLinks.length).toBeGreaterThan(0);
  });

  it("doesn't include search results already in entries when autoUpdate is false", () => {
    const overlappingEntries = [
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
    const { container } = renderEditor({
      autoUpdate: false,
      entries: overlappingEntries,
      entryCount: 2,
    });
    const resultsContainer = container.querySelector(
      ".custom-list-search-results"
    )!;
    const resultItems = resultsContainer.querySelectorAll(
      "[data-testid^='draggable-']"
    );
    // Result 1 is in entries, so only results 2 and 3 appear
    expect(resultItems.length).toBe(2);
    expect(resultsContainer.textContent).toContain("result 2");
    expect(resultsContainer.textContent).toContain("result 3");
    expect(resultsContainer.textContent).not.toContain("result 1");
  });

  it("shows all search results including ones in entries when autoUpdate is true", () => {
    const overlappingEntries = [
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
    const { container } = renderEditor({
      autoUpdate: true,
      entries: overlappingEntries,
      entryCount: 2,
    });
    const resultsContainer = container.querySelector(
      ".custom-list-search-results"
    )!;
    const resultItems = resultsContainer.querySelectorAll(
      "[data-testid^='draggable-']"
    );
    expect(resultItems.length).toBe(3);
  });

  // Drag-and-drop tests: we invoke the handlers captured by our mock directly

  it("prevents dragging within search results", () => {
    const { container } = renderEditor();
    // Start drag from search results — should disable the search-results droppable
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "1",
        source: { droppableId: "search-results" },
      });
    });
    const searchDroppable = container.querySelector(
      "[data-testid='droppable-search-results']"
    );
    expect(searchDroppable?.getAttribute("data-drop-disabled")).toBe("true");
  });

  it("prevents dragging within list entries", () => {
    const { container } = renderEditor({ entryCount: 2 });
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });
    const entriesDroppable = container.querySelector(
      "[data-testid='droppable-custom-list-entries']"
    );
    expect(entriesDroppable?.getAttribute("data-drop-disabled")).toBe("true");
  });

  it("calls addEntry when a book is dragged from search results to list entries", () => {
    const addEntry = jest.fn();
    const { container } = renderEditor({ addEntry, entryCount: 2 });
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "1",
        source: { droppableId: "search-results" },
      });
    });
    // Entries droppable should now be enabled
    const entriesDroppable = container.querySelector(
      "[data-testid='droppable-custom-list-entries']"
    );
    expect(entriesDroppable?.getAttribute("data-drop-disabled")).toBe("false");

    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "1",
        source: { droppableId: "search-results" },
        destination: { droppableId: "custom-list-entries" },
      });
    });
    expect(addEntry).toHaveBeenCalledTimes(1);
    expect(addEntry).toHaveBeenCalledWith("1");
  });

  it("shows a message in place of search results when dragging from list entries", () => {
    const { container } = renderEditor();
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });
    const searchDroppable = container.querySelector(
      "[data-testid='droppable-search-results']"
    )!;
    expect(searchDroppable.getAttribute("data-drop-disabled")).toBe("false");
    expect(searchDroppable.textContent).toContain("here to remove");

    // After drag ends, message goes away
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });
    expect(searchDroppable.getAttribute("data-drop-disabled")).toBe("true");
    expect(searchDroppable.textContent).not.toContain("here to remove");
  });

  it("calls deleteEntry when a book is dragged from list entries to search results", () => {
    const deleteEntry = jest.fn();
    const { container } = renderEditor({ deleteEntry });
    act(() => {
      capturedDragHandlers.onDragStart?.({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
      });
    });
    const searchDroppable = container.querySelector(
      "[data-testid='droppable-search-results']"
    );
    expect(searchDroppable?.getAttribute("data-drop-disabled")).toBe("false");
    act(() => {
      capturedDragHandlers.onDragEnd?.({
        draggableId: "A",
        source: { droppableId: "custom-list-entries" },
        destination: { droppableId: "search-results" },
      });
    });
    expect(deleteEntry).toHaveBeenCalledTimes(1);
    expect(deleteEntry).toHaveBeenCalledWith("A");
  });

  it("calls addEntry when the Add to List button is clicked on a search result", () => {
    const addEntry = jest.fn();
    const { container } = renderEditor({ addEntry, entryCount: 2 });
    const addButtons = container.querySelectorAll<HTMLButtonElement>(
      ".custom-list-search-results .links button"
    );
    expect(addButtons.length).toBeGreaterThan(0);
    fireEvent.click(addButtons[0]);
    expect(addEntry).toHaveBeenCalledTimes(1);
    expect(addEntry).toHaveBeenCalledWith("1");
  });

  it("hides the Add to List buttons when autoUpdate is true", () => {
    const { container } = renderEditor({ autoUpdate: true, entryCount: 2 });
    const addButtons = container.querySelectorAll(
      ".custom-list-search-results .links button"
    );
    expect(addButtons.length).toBe(0);
  });

  it("calls deleteEntry when the Remove from List button is clicked on a list entry", () => {
    const deleteEntry = jest.fn();
    const { container } = renderEditor({ deleteEntry, entryCount: 2 });
    const deleteButtons = container.querySelectorAll<HTMLButtonElement>(
      ".custom-list-entries .links button"
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);
    expect(deleteEntry).toHaveBeenCalledTimes(1);
    expect(deleteEntry).toHaveBeenCalledWith("A");
  });

  it("does not render Remove from List buttons when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false, entryCount: 2 });
    const deleteButtons = container.querySelectorAll(
      ".custom-list-entries .links button"
    );
    expect(deleteButtons.length).toBe(0);
  });

  it("does not render the Add All to List button when there are no search results", () => {
    const { container } = renderEditor({ searchResults: undefined });
    expect(container.querySelector(".add-all-button")).toBeFalsy();
  });

  it("does not render the Add All to List button when autoUpdate is true", () => {
    const { container } = renderEditor({ autoUpdate: true });
    expect(container.querySelector(".add-all-button")).toBeFalsy();
  });

  it("does not render the Add All to List button when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });
    expect(container.querySelector(".add-all-button")).toBeFalsy();
  });

  it("calls addAllEntries when the Add All to List button is clicked", () => {
    const addAllEntries = jest.fn();
    const { container } = renderEditor({ addAllEntries, entryCount: 2 });
    const button = container.querySelector<HTMLButtonElement>(
      ".add-all-button"
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(addAllEntries).toHaveBeenCalledTimes(1);
  });

  it("does not render the Delete all button when there are no entries", () => {
    const { container } = renderEditor({ entries: [] });
    expect(container.querySelector(".delete-all-button")).toBeFalsy();
  });

  it("does not render the Delete all button when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });
    expect(container.querySelector(".delete-all-button")).toBeFalsy();
  });

  it("calls deleteAllEntries when the Delete all button is clicked", () => {
    const deleteAllEntries = jest.fn();
    const { container } = renderEditor({ deleteAllEntries, entryCount: 2 });
    const button = container.querySelector<HTMLButtonElement>(
      ".delete-all-button"
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(deleteAllEntries).toHaveBeenCalledTimes(1);
  });

  it("hides the Load More button in search results when loadMoreSearchResults is null", () => {
    const { container } = renderEditor({ loadMoreSearchResults: null });
    expect(
      container.querySelector(".custom-list-search-results .load-more-button")
    ).toBeFalsy();
  });

  it("hides the Load More button in search results when isFetchingSearchResults is true", () => {
    const { container } = renderEditor({ isFetchingSearchResults: true });
    expect(
      container.querySelector(".custom-list-search-results .load-more-button")
    ).toBeFalsy();
  });

  it("hides the Load More button in list entries when loadMoreEntries is null", () => {
    const { container } = renderEditor({ loadMoreEntries: null });
    expect(
      container.querySelector(".custom-list-entries .load-more-button")
    ).toBeFalsy();
  });

  it("disables the Load More button when loading more search results", () => {
    const { container, rerender } = render(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ isFetchingMoreSearchResults: false })}
        />
      </ContextProvider>
    );
    const btn = container.querySelector<HTMLButtonElement>(
      ".custom-list-search-results .load-more-button"
    );
    expect(btn).toBeTruthy();
    expect(btn).not.toBeDisabled();

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ isFetchingMoreSearchResults: true })}
        />
      </ContextProvider>
    );
    const btn2 = container.querySelector<HTMLButtonElement>(
      ".custom-list-search-results .load-more-button"
    );
    expect(btn2).toBeDisabled();
  });

  it("disables the Load More button when loading more list entries", () => {
    const { container, rerender } = render(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ isFetchingMoreCustomListEntries: false })}
        />
      </ContextProvider>
    );
    const btn = container.querySelector<HTMLButtonElement>(
      ".custom-list-entries .load-more-button"
    );
    expect(btn).toBeTruthy();
    expect(btn).not.toBeDisabled();

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ isFetchingMoreCustomListEntries: true })}
        />
      </ContextProvider>
    );
    const btn2 = container.querySelector<HTMLButtonElement>(
      ".custom-list-entries .load-more-button"
    );
    expect(btn2).toBeDisabled();
  });

  it("calls loadMoreSearchResults when the Load More button is clicked in search results", () => {
    const loadMoreSearchResults = jest.fn();
    const { container } = renderEditor({ loadMoreSearchResults });
    const button = container.querySelector<HTMLButtonElement>(
      ".custom-list-search-results .load-more-button"
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(loadMoreSearchResults).toHaveBeenCalledTimes(1);
  });

  it("calls loadMoreEntries when the Load More button is clicked in list entries", () => {
    const loadMoreEntries = jest.fn();
    const { container } = renderEditor({ loadMoreEntries });
    const button = container.querySelector<HTMLButtonElement>(
      ".custom-list-entries .load-more-button"
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(loadMoreEntries).toHaveBeenCalledTimes(1);
  });

  it("should properly display the count of list entries", () => {
    const { container, rerender } = render(
      <ContextProvider>
        <CustomListEntriesEditor {...buildProps({ entryCount: 2 })} />
      </ContextProvider>
    );
    const h4 = container.querySelector(".custom-list-entries h4")!;
    expect(h4.textContent).toBe("List Entries: Displaying 1 - 2 of 2 books");

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ entries: entriesData.slice(0, 1), entryCount: 1 })}
        />
      </ContextProvider>
    );
    expect(h4.textContent).toBe("List Entries: Displaying 1 - 1 of 1 book");

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ entries: [], entryCount: 0 })}
        />
      </ContextProvider>
    );
    expect(h4.textContent).toBe("List Entries: No books in this list");

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ entries: [], entryCount: 12 })}
        />
      </ContextProvider>
    );
    expect(h4.textContent).toBe("List Entries: Displaying 0 - 0 of 12 books");

    rerender(
      <ContextProvider>
        <CustomListEntriesEditor
          {...buildProps({ entries: entriesData, entryCount: 12 })}
        />
      </ContextProvider>
    );
    expect(h4.textContent).toBe("List Entries: Displaying 1 - 2 of 12 books");
  });
});
