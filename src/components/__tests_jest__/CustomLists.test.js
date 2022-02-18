import { getAllByRole, waitFor } from "@testing-library/react";
import React from "react";
import { render } from "../../testUtils/testUtils";
import CustomLists from "../CustomLists";

const listsData = [
  { id: 1, name: "a list", title: "a list", entry_count: 0, collections: [] },
  {
    id: 2,
    name: "z list",
    title: "z list",
    entry_count: 1,
    collections: [{ id: 3, name: "collection 3", protocol: "protocol" }],
  },
];

const searchResults = {
  id: "id",
  url: "url",
  title: "title",
  lanes: [],
  books: [],
  navigationLinks: [],
};

const collections = [
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "other library" }],
  },
  {
    id: 2,
    name: "collection 2",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
  },
  {
    id: 3,
    name: "collection 3",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
  },
];

const libraries = [
  {
    short_name: "library",
    settings: {
      enabled_entry_points: ["Book", "Audio"],
    },
  },
  {
    short_name: "another library",
    settings: {
      enabled_entry_points: ["Audio"],
    },
  },
];

const languages = {
  eng: ["English"],
  spa: ["Spanish", "Castilian"],
  fre: ["French"],
};

const fetchCustomLists = jest.fn();
const fetchCustomListDetails = jest.fn();
const editCustomList = jest.fn();
const deleteCustomList = jest.fn();
const search = jest.fn();
const loadMoreSearchResults = jest.fn();
const loadMoreEntries = jest.fn();
const fetchCollections = jest.fn();
const fetchLibraries = jest.fn();
const fetchLanes = jest.fn();
const fetchLanguages = jest.fn();

const customListsProps = {
  csrfToken: "token",
  library: "library",
  lists: listsData,
  searchResults: searchResults,
  collections: collections,
  isFetching: false,
  isFetchingMoreSearchResults: false,
  isFetchingMoreCustomListEntries: false,
  fetchLanguages: fetchLanguages,
  fetchCustomLists: fetchCustomLists,
  fetchCustomListDetails: fetchCustomListDetails,
  editCustomList: editCustomList,
  deleteCustomList: deleteCustomList,
  search: search,
  loadMoreSearchResults: loadMoreSearchResults,
  loadMoreEntries: loadMoreEntries,
  fetchCollections: fetchCollections,
  fetchLibraries: fetchLibraries,
  fetchLanes: fetchLanes,
  libraries: libraries,
  languages: languages,
};

let utils;

beforeEach(() => {
  utils = render(<CustomLists {...customListsProps} />);
});

// Skipping this test for now. Tests for this component fail because the store cannot be found.
// However, the store should be created in the context, which I wrapped around all test components
// in testUtils. This will need further investigation to resolve.
test.skip("calls fetchCustomLists and fetchCustomListDetails when a list's edit button is clicked", () => {
  const editButtonListA = waitFor(
    () => getAllByRole("button", { name: "Edit" })[0]
  );

  waitFor(() => expect(editButtonListA).toBeInTheDocument());
});
