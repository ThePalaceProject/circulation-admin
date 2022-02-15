import React from "react";
import { within } from "@testing-library/react";
import { render } from "../../testUtils/testUtils";
import CustomListEditorBody from "../CustomListEditorBody";
import { DragDropContext } from "react-beautiful-dnd";

const languages = {
  eng: ["English"],
};

const library = {
  uuid: "uuid",
  name: "name",
  short_name: "library",
  settings: {
    large_collections: ["eng", "fre", "spa"],
  },
};

const listData = {
  id: "1",
  url: "some url",
  title: "original list title",
  lanes: [],
  books: [
    {
      id: "A",
      title: "entry A",
      authors: ["author 1"],
      raw: {
        $: {
          "schema:additionalType": { value: "http://schema.org/EBook" },
        },
      },
    },
    {
      id: "B",
      title: "entry B",
      authors: ["author 2a", "author 2b"],
      raw: {
        $: {
          "schema:additionalType": { value: "http://schema.org/EBook" },
        },
      },
    },
  ],
  navigationLinks: [],
};

const searchResultsData = {
  id: "id",
  url: "url",
  title: "title - search",
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

const search = jest.fn();
const loadMoreSearchResults = jest.fn();
const loadMoreEntries = jest.fn();
const saveFormData = jest.fn();
const setDraftCollections = jest.fn();
const onDragEnd = jest.fn();
let utils;

beforeEach(() => {
  utils = render(
    <DragDropContext onDragEnd={onDragEnd}>
      <CustomListEditorBody
        entries={listData.books}
        draftTitle={listData.title}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        languages={languages}
        library={library}
        listId={listData.id}
        search={search}
        setDraftCollections={setDraftCollections}
        saveFormData={saveFormData}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        totalListEntries={2}
      />
    </DragDropContext>
  );
});

test("if there are entries passed, they render on the page", () => {
  const entriesHeader = utils.getByRole("heading", {
    level: 4,
    name: "Displaying 1 - 2 of 2 Books",
  });
  expect(entriesHeader).toBeInTheDocument();

  const entries = utils.getAllByRole("list")[1];

  const entryA = within(entries).getByText("entry A");
  const entryB = within(entries).getByText("entry B");

  expect(entryA).toBeInTheDocument();
  expect(entryB).toBeInTheDocument();
});

test("if there are no entries, then none render", () => {
  utils = render(
    <DragDropContext onDragEnd={onDragEnd}>
      <CustomListEditorBody
        entries={[]}
        draftTitle={""}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        languages={languages}
        library={library}
        search={search}
        setDraftCollections={setDraftCollections}
        saveFormData={saveFormData}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
      />
    </DragDropContext>
  );

  const entriesHeader = utils.getByRole("heading", {
    level: 4,
    name: "No books in this list",
  });
  expect(entriesHeader).toBeInTheDocument();
});

test("there is a container to display search results", () => {
  const searchResultsContainer = utils.getByRole("region", {
    name: "Search Results",
  });

  const searchResultsHeader = within(
    searchResultsContainer
  ).getByRole("heading", { level: 4 });

  expect(searchResultsHeader).toHaveTextContent("Search Results");

  const searchResultsDragInstructions = within(
    searchResultsContainer
  ).getByText("remove them from", {
    exact: false,
  });

  expect(searchResultsDragInstructions).toBeInTheDocument();
});
