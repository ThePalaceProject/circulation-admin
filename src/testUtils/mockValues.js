export const collections = [
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "LIB" }],
  },
  {
    id: 2,
    name: "collection 2",
    protocol: "protocol",
    libraries: [{ short_name: "LIB" }],
  },
  {
    id: 3,
    name: "collection 3",
    protocol: "protocol",
    libraries: [{ short_name: "LIB" }],
  },
];
export const entryCount = 2;
export const entryPoints = ["Book", "Audio"];
export const languages = {
  eng: ["English"],
};

export const library = {
  uuid: "uuid",
  name: "Library",
  short_name: "LIB",
  settings: {
    large_collections: ["eng", "fre", "spa"],
  },
};

export const listData = {
  id: "1",
  url: "some url",
  title: "List A",
  lanes: [],
  books: [
    {
      id: "A",
      title: "Entry A",
      authors: ["Author 1"],
      raw: {
        $: {
          "schema:additionalType": { value: "http://schema.org/EBook" },
        },
      },
    },
    {
      id: "B",
      title: "Entry B",
      authors: ["Author 2A", "Author 2B"],
      raw: {
        $: {
          "schema:additionalType": { value: "http://schema.org/EBook" },
        },
      },
    },
  ],
  navigationLinks: [],
};

export const lists = [
  {
    collections: [],
    entry_count: 2,
    id: 1,
    name: "List A",
  },
  {
    collections: [],
    entry_count: 3,
    id: 2,
    name: "List B",
  },
  {
    collections: [],
    entry_count: 4,
    id: 3,
    name: "List C",
  },
  {
    collections: [],
    entry_count: 5,
    id: 4,
    name: "List D",
  },
];

export const searchResults = {
  id: "id",
  url: "url",
  title: "title - search",
  lanes: [],
  navigationLinks: [],
  books: [
    {
      id: "1",
      title: "Result 1",
      authors: ["Author 1"],
      url: "/some/url1",
      language: "eng",
      raw: {
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      },
    },
    {
      id: "2",
      title: "Result 2",
      authors: ["Author 2A", "Author 2B"],
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
      title: "Result 3",
      authors: ["Author 3"],
      url: "/some/url3",
      language: "eng",
      raw: {
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      },
    },
  ],
};

export const changeSort = jest.fn();
export const deleteCustomList = jest.fn();
export const editCustomList = jest.fn();
export const loadMoreEntries = jest.fn();
export const loadMoreSearchResults = jest.fn();
export const onDragEnd = jest.fn();
export const resetResponseBodyState = jest.fn();
export const search = jest.fn();
export const saveFormData = jest.fn();
