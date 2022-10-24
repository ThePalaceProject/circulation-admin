import * as React from "react";
import { render } from "../../testUtils/testUtils";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import CustomListEditor from "../CustomListEditor";
import {
  collections,
  editCustomList,
  entryCount,
  entryPoints,
  languages,
  library,
  listData,
  loadMoreEntries,
  loadMoreSearchResults,
  search,
  searchResults,
} from "../../testUtils/mockValues";

describe("CustomListEditor", () => {
  let utils;
  beforeEach(() => {
    utils = render(
      <CustomListEditor
        collections={collections}
        editCustomList={editCustomList}
        entryCount={entryCount}
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        languages={languages}
        library={library}
        list={listData}
        listCollections={[collections[0]]}
        listId={listData.id}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        responseBody={undefined}
        search={search}
        searchResults={searchResults}
        startingTitle=""
      />
    );
  });

  it("renders the list title and an edit button", () => {
    const listTitle = screen.getByRole("heading", { level: 3 });

    expect(listTitle).toHaveTextContent(/list a/i);

    const editListButton = within(listTitle).getByRole("button");

    expect(editListButton).toHaveTextContent(/edit list title/i);
  });

  it("changes the title to an editable input if the edit button is clicked", async () => {
    let listTitle = screen.getByRole("heading", { level: 3 });

    let titleButton = within(listTitle).getByRole("button");

    await fireEvent.click(titleButton);

    listTitle = screen.getByRole("heading", { level: 3 });

    const listTitleInput = within(listTitle).getByRole("textbox");

    expect(listTitleInput.value).toBe("List A");

    titleButton = within(listTitle).getByRole("button");

    expect(titleButton).toHaveTextContent(/save list title/i);

    await fireEvent.change(listTitleInput, { target: { value: "List B" } });

    titleButton = within(listTitle).getByRole("button");
    expect(titleButton).toHaveTextContent(/save list title/i);

    await fireEvent.click(titleButton);

    expect(editCustomList).toHaveBeenCalled();
  });

  it("renders a collections accordion with the correct collections checked", async () => {
    const collectionsAccordion = screen.getByRole("button", {
      name: "Add from collections",
      expanded: false,
    });

    expect(collectionsAccordion).toBeInTheDocument();

    await fireEvent.click(collectionsAccordion);

    const collectionsCheckboxes = screen.getAllByRole("checkbox");

    expect(collectionsCheckboxes.length).toBe(3);

    const collection1Checkbox = collectionsCheckboxes[0];
    const collection2Checkbox = collectionsCheckboxes[1];

    expect(collection1Checkbox.checked).toBe(true);
    expect(collection2Checkbox.checked).toBe(false);

    await fireEvent.click(collection2Checkbox);

    expect(editCustomList).toHaveBeenCalled();
  });

  it("renders a search accordion", async () => {
    const searchAccordion = screen.getByRole("button", {
      name: "Search for titles",
      expanded: true,
    });

    expect(searchAccordion).toBeInTheDocument();

    const entryPoints = screen.getAllByRole("radio");

    expect(entryPoints.length).toEqual(3);

    const allEntryPoint = entryPoints[0];

    expect(allEntryPoint.checked).toBe(true);

    const searchInput = screen.getByPlaceholderText(/enter a search term/i);
    const searchButton = screen.getByRole("button", { name: "Search" });

    expect(searchInput).toBeInTheDocument();

    await fireEvent.change(searchInput, { target: { value: "a" } });
    await fireEvent.click(searchButton);

    expect(search).toHaveBeenCalled();
  });

  it("renders entries if a list is passed", async () => {
    const entriesHeader = await waitFor(() =>
      screen.getByRole("heading", {
        level: 4,
        name: "Displaying 1 - 2 of 2 Books",
      })
    );

    expect(entriesHeader).toBeInTheDocument();

    const lists = screen.getAllByRole("list");

    expect(lists).toHaveLength(2);

    const entries = lists[1];

    const entryA = within(entries).getByText(/entry A/i);
    const entryB = within(entries).getByText(/entry B/i);
    const removeFromListButtons = within(entries).getAllByRole("button", {
      name: /remove from list/i,
    });

    expect(entryA).toBeInTheDocument();
    expect(entryB).toBeInTheDocument();

    expect(removeFromListButtons.length).toEqual(2);
  });

  it("renders search results if search results are passed", () => {
    const lists = screen.getAllByRole("list");

    const searchResults = lists[0];

    const searchResult1 = within(searchResults).getByText(/result 1/i);
    const searchResult2 = within(searchResults).getByText(/result 2/i);
    const searchResult3 = within(searchResults).getByText(/result 3/i);
    const addToListButtons = within(searchResults).getAllByRole("button", {
      name: /add to list/i,
    });

    expect(searchResult1).toBeInTheDocument();
    expect(searchResult2).toBeInTheDocument();
    expect(searchResult3).toBeInTheDocument();

    expect(addToListButtons.length).toEqual(3);
  });

  it("calls editCustomList if books are added to or removed from the list", async () => {
    const lists = screen.getAllByRole("list");

    const searchResults = lists[0];
    const entries = lists[1];

    const firstSearchResultButton = within(searchResults).getAllByRole(
      "button",
      {
        name: /add to list/i,
      }
    )[0];

    await fireEvent.click(firstSearchResultButton);

    expect(editCustomList).toHaveBeenCalled();

    const addAllResultsButton = screen.getByRole("button", {
      name: /add all to list/i,
    });

    await fireEvent.click(addAllResultsButton);

    expect(editCustomList).toHaveBeenCalled();

    const firstEntryButton = within(entries).getAllByRole("button", {
      name: /remove from list/i,
    })[0];

    await fireEvent.click(firstEntryButton);

    expect(editCustomList).toHaveBeenCalled();

    const deleteAllEntriesButton = screen.getByRole("button", {
      name: "Delete",
    });

    await fireEvent.click(deleteAllEntriesButton);

    expect(editCustomList).toHaveBeenCalled();
  });

  it("displays a message that there are no books in a list if no list is passed", () => {
    const { rerender } = utils;

    rerender(
      <CustomListEditor
        collections={collections}
        editCustomList={editCustomList}
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        languages={languages}
        library={library}
        listCollections={[collections[0]]}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        responseBody={undefined}
        search={search}
        searchResults={null}
        startingTitle=""
      />
    );

    const lists = screen.queryAllByRole("list");

    expect(lists).toHaveLength(2);

    const entries = screen.getAllByRole("list")[1];

    const entryA = within(entries).queryAllByText("entry A");
    const entryB = within(entries).queryAllByText("entry B");

    expect(entryA).toHaveLength(0);
    expect(entryB).toHaveLength(0);

    const entriesHeader = screen.getByRole("heading", {
      level: 4,
      name: "No books in this list",
    });
    expect(entriesHeader).toBeInTheDocument();
  });
});
