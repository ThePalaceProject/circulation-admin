import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CustomListEditor, {
  CustomListEditorProps,
} from "../../../src/components/CustomListEditor";

// Each list entry renders a web-opds-client CatalogLink whose `collectionUrl` is
// the list's opdsFeedUrl. Mock it to a marker that echoes that URL, so the
// crawlable-feed derivation can be asserted without router/pathFor context.
jest.mock(
  "@thepalaceproject/web-opds-client/lib/components/CatalogLink",
  () => ({
    __esModule: true,
    default: (props: any) => (
      <a
        href={props.bookUrl}
        data-testid="catalog-link"
        data-collection-url={props.collectionUrl}
      >
        {props.children}
      </a>
    ),
  })
);

describe("CustomListEditor", () => {
  // CustomListEntriesEditor calls Element.scrollTo on mount, which JSDOM does
  // not implement, so stub it.
  Element.prototype.scrollTo = () => {};

  const searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: [],
  };

  const entries = {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  };

  const entryPoints = ["Book", "Audio"];

  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "library",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const properties = {
    name: "Listy McList",
    collections: [2],
    autoUpdate: false,
  };

  const searchParams = {
    entryPoint: "All",
    terms: "",
    sort: null,
    language: "all",
    advanced: {
      include: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
      exclude: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
    },
  };

  const makeProps = (
    overrides: Partial<CustomListEditorProps> = {}
  ): CustomListEditorProps => ({
    entries,
    entryPoints,
    isFetchingMoreCustomListEntries: false,
    isFetchingSearchResults: false,
    isFetchingMoreSearchResults: false,
    isLoaded: false,
    isModified: true,
    isOwner: true,
    isValid: true,
    languages,
    library: library as CustomListEditorProps["library"],
    listId: "1",
    properties: properties as CustomListEditorProps["properties"],
    searchParams: searchParams as CustomListEditorProps["searchParams"],
    searchResults: searchResults as CustomListEditorProps["searchResults"],
    loadMoreEntries: jest.fn(),
    loadMoreSearchResults: jest.fn(),
    reset: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    search: jest.fn(),
    share: jest.fn(),
    updateProperty: jest.fn(),
    updateSearchParam: jest.fn(),
    ...overrides,
  });

  const renderEditor = (overrides: Partial<CustomListEditorProps> = {}) => {
    const props = makeProps(overrides);
    const result = render(<CustomListEditor {...props} />);
    const rerender = (nextOverrides: Partial<CustomListEditorProps>) =>
      result.rerender(<CustomListEditor {...makeProps(nextOverrides)} />);
    return { ...result, rerender, props };
  };

  it("shows the list title with an edit button", () => {
    renderEditor();

    // The editable title (TextWithEditMode) shows the name and an edit button.
    expect(screen.getByText("Listy McList")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Edit list title/ })
    ).toBeInTheDocument();
  });

  it("shows the list title without an edit button when isOwner is false", () => {
    renderEditor({ isOwner: false });

    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveTextContent("Listy McList");
    expect(
      screen.queryByRole("button", { name: /Edit list title/ })
    ).not.toBeInTheDocument();
  });

  it("shows the list id", () => {
    renderEditor();

    const listId = screen.getByRole("heading", { level: 4, name: /ID-1/ });
    expect(listId).toHaveTextContent("1");
  });

  it("shows an entries editor with list entries and search results", () => {
    renderEditor();

    // The entries editor renders both the search results and list-entries columns.
    expect(
      screen.getByRole("heading", { name: "Search Results" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /List Entries:.*No books in this list/,
      })
    ).toBeInTheDocument();
  });

  it("gives each entry of a saved list a crawlable OPDS feed URL", () => {
    // opdsFeedUrl is `${short_name}/lists/${savedName}/crawlable`, but only when
    // the list has both a listId and a savedName (CustomListEditor.tsx:124). It
    // reaches the DOM as the collectionUrl of each list entry's catalog link.
    renderEditor({
      savedName: "saved-list",
      entries: {
        ...entries,
        current: [{ id: "book1", title: "A Book", url: "/works/book1" }],
        currentTotalCount: 1,
      } as CustomListEditorProps["entries"],
    });

    expect(screen.getByTestId("catalog-link")).toHaveAttribute(
      "data-collection-url",
      "library/lists/saved-list/crawlable"
    );
  });

  it("disables entry point options when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });

    const entryPointsSection =
      container.querySelector<HTMLElement>(".entry-points");
    within(entryPointsSection)
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).toBeDisabled());
  });

  it("shows entry point options", () => {
    const { container } = renderEditor();

    const entryPointsSection =
      container.querySelector<HTMLElement>(".entry-points");

    const all = within(entryPointsSection).getByRole("radio", { name: "All" });
    expect(all).toHaveAttribute("value", "All");
    expect(all).toBeChecked();

    const book = within(entryPointsSection).getByRole("radio", {
      name: "Book",
    });
    expect(book).toHaveAttribute("value", "Book");
    expect(book).not.toBeChecked();

    const audio = within(entryPointsSection).getByRole("radio", {
      name: "Audio",
    });
    expect(audio).toHaveAttribute("value", "Audio");
    expect(audio).not.toBeChecked();
  });

  it("enables the save button when the list has changes and is valid", () => {
    renderEditor();

    expect(
      screen.getByRole("button", { name: "Save this list" })
    ).toBeEnabled();
  });

  it("disables the save button when the list does not have changes", () => {
    renderEditor({ isModified: false });

    expect(
      screen.getByRole("button", { name: "Save this list" })
    ).toBeDisabled();
  });

  it("disables the save button when the list is invalid", () => {
    renderEditor({ isValid: false });

    expect(
      screen.getByRole("button", { name: "Save this list" })
    ).toBeDisabled();
  });

  it("calls save when the save button is clicked", async () => {
    const user = userEvent.setup();
    const save = jest.fn().mockResolvedValue(undefined);
    renderEditor({ save });

    await user.click(screen.getByRole("button", { name: "Save this list" }));

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("disables the cancel button when the list does not have changes", () => {
    renderEditor({ isModified: false });

    expect(
      screen.getByRole("button", { name: "Cancel changes" })
    ).toBeDisabled();
  });

  it("calls reset when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    renderEditor({ reset });

    await user.click(screen.getByRole("button", { name: "Cancel changes" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("does not render save/cancel buttons when isOwner is false", () => {
    renderEditor({ isOwner: false });

    expect(
      screen.queryByRole("button", { name: "Save this list" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel changes" })
    ).not.toBeInTheDocument();
  });

  it("renders a CustomListSearch component", () => {
    const { container } = renderEditor();

    // CustomListSearch renders its search panel (a collapsible Panel whose
    // header is a button) with the entry point options.
    expect(
      screen.getByRole("button", { name: "Search for titles" })
    ).toBeInTheDocument();
    expect(container.querySelector(".entry-points")).toBeInTheDocument();
  });

  it("updates the autoUpdate property from the search component", async () => {
    const user = userEvent.setup();
    // The auto-update controls only render when auto-update is enabled and the
    // list is new (listId null), which is when the radios are interactive.
    const updateProperty = jest.fn();
    renderEditor({
      updateProperty,
      isAutoUpdateEnabled: true,
      listId: null,
      properties: { ...properties, autoUpdate: false },
    });

    await user.click(
      screen.getByRole("radio", { name: "Automatically update this list" })
    );

    expect(updateProperty).toHaveBeenCalledTimes(1);
    expect(updateProperty).toHaveBeenCalledWith("autoUpdate", true);
  });

  it("calls search when listId changes", () => {
    const search = jest.fn();
    const { rerender } = renderEditor({ search });

    expect(search).toHaveBeenCalledTimes(1);

    rerender({ search, listId: "2" });

    expect(search).toHaveBeenCalledTimes(2);
  });

  it("calls search when isLoaded changes", () => {
    const search = jest.fn();
    const { rerender } = renderEditor({ search });

    expect(search).toHaveBeenCalledTimes(1);

    rerender({ search, isLoaded: true });

    expect(search).toHaveBeenCalledTimes(2);
  });

  it("calls share when the share button is clicked", async () => {
    const user = userEvent.setup();
    const share = jest.fn();
    const { container } = renderEditor({ share });

    const shareButton = container.querySelector<HTMLButtonElement>(
      ".sharing-info button"
    );
    expect(shareButton).toBeInTheDocument();

    await user.click(shareButton);

    expect(share).toHaveBeenCalledTimes(1);
  });

  it("does not render a share button when listId is undefined", () => {
    const { container } = renderEditor({ listId: undefined });

    expect(container.querySelector(".sharing-info")).not.toBeInTheDocument();
  });

  it("does not render a share button when isOwner is false", () => {
    const { container } = renderEditor({ isOwner: false });

    expect(
      container.querySelector(".sharing-info button")
    ).not.toBeInTheDocument();
  });
});
