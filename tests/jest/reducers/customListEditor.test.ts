import reducer, {
  getCustomListEditorFormData,
  getCustomListEditorSearchUrl,
  initialState,
} from "../../../src/reducers/customListEditor";

import ActionCreator from "../../../src/actions";

describe("custom list editor reducer", () => {
  // ── SET_FEATURE_FLAGS ──────────────────────────────────────────────────────

  describe("on SET_FEATURE_FLAGS", () => {
    it("sets isAutoUpdateEnabled to true if enableAutoList feature flag is true", () => {
      const state = { ...initialState, isAutoUpdateEnabled: false };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: { enableSomethingElse: false, enableAutoList: true },
      });

      expect(nextState.isAutoUpdateEnabled).toBe(true);
    });

    it("sets isAutoUpdateEnabled to false if enableAutoList feature flag is false", () => {
      const state = { ...initialState, isAutoUpdateEnabled: true };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: { enableSomethingElse: false, enableAutoList: false },
      });

      expect(nextState.isAutoUpdateEnabled).toBe(false);
    });

    it("keeps isAutoUpdateEnabled unchanged if enableAutoList flag is not present", () => {
      const state = { ...initialState, isAutoUpdateEnabled: true };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: { enableSomethingElse: true },
      });

      expect(nextState.isAutoUpdateEnabled).toBe(true);
    });
  });

  // ── UPDATE_FEATURE_FLAG ────────────────────────────────────────────────────

  describe("on UPDATE_FEATURE_FLAG", () => {
    it("sets isAutoUpdateEnabled to true if flag name is enableAutoList and value is true", () => {
      const state = { ...initialState, isAutoUpdateEnabled: false };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_FEATURE_FLAG,
        name: "enableAutoList",
        value: true,
      });

      expect(nextState.isAutoUpdateEnabled).toBe(true);
    });

    it("sets isAutoUpdateEnabled to false if flag name is enableAutoList and value is false", () => {
      const state = { ...initialState, isAutoUpdateEnabled: true };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_FEATURE_FLAG,
        name: "enableAutoList",
        value: false,
      });

      expect(nextState.isAutoUpdateEnabled).toBe(false);
    });
  });

  // ── OPEN_CUSTOM_LIST_EDITOR ────────────────────────────────────────────────

  describe("on OPEN_CUSTOM_LIST_EDITOR", () => {
    const listData = {
      custom_lists: [
        {
          id: 22,
          name: "Awesome List",
          collections: [{ id: 1 }, { id: 3 }],
          is_owner: true,
          is_shared: false,
          entry_count: 5,
          auto_update: false,
          auto_update_query: null,
          auto_update_facets: null,
          auto_update_status: "",
        },
      ],
    };

    it("sets id, name, collections, and baselineTotalCount from the list data", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: 22,
        data: listData,
      });

      expect(nextState.id).toBe(22);
      expect(nextState.properties.baseline.name).toBe("Awesome List");
      expect(nextState.properties.baseline.collections).toEqual([1, 3]);
      expect(nextState.entries.baselineTotalCount).toBe(5);
    });

    it("sets error if the list id is not found in the data", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: 99,
        data: listData,
      });

      expect(nextState.error).toBeTruthy();
    });

    it("sets id to null if no id is given (new list)", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: null,
        data: listData,
      });

      expect(nextState.id).toBeNull();
    });
  });

  // ── UPDATE_CUSTOM_LIST_EDITOR_PROPERTY ────────────────────────────────────

  describe("on UPDATE_CUSTOM_LIST_EDITOR_PROPERTY", () => {
    it("updates the current name property", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "Old Name",
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "name",
        value: "New Name",
      });

      expect(nextState.properties.current.name).toBe("New Name");
    });

    it("updates isModified when name changes", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          baseline: {
            ...initialState.properties.baseline,
            name: "Baseline Name",
          },
          current: {
            ...initialState.properties.current,
            name: "Baseline Name",
          },
        },
        isModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "name",
        value: "Changed Name",
      });

      expect(nextState.isModified).toBe(true);
    });
  });

  // ── TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION ──────────────────────────────────

  describe("on TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION", () => {
    it("adds a collection id that is not already present", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            collections: [1, 2],
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
        id: 3,
      });

      expect(nextState.properties.current.collections).toContain(3);
    });

    it("removes a collection id that is already present", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            collections: [1, 2, 3],
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
        id: 2,
      });

      expect(nextState.properties.current.collections).not.toContain(2);
      expect(nextState.properties.current.collections).toContain(1);
      expect(nextState.properties.current.collections).toContain(3);
    });
  });

  // ── UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM ────────────────────────────────

  describe("on UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM", () => {
    it("updates the entryPoint search param", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "entryPoint",
        value: "Book",
      });

      expect(nextState.searchParams.current.entryPoint).toBe("Book");
    });

    it("sets isSearchModified when search param changes from baseline", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          baseline: {
            ...initialState.searchParams.baseline,
            entryPoint: "All",
          },
          current: {
            ...initialState.searchParams.current,
            entryPoint: "All",
          },
        },
        isSearchModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "entryPoint",
        value: "Book",
      });

      expect(nextState.isSearchModified).toBe(true);
    });
  });

  // ── ADD_CUSTOM_LIST_EDITOR_ENTRY ──────────────────────────────────────────

  describe("on ADD_CUSTOM_LIST_EDITOR_ENTRY", () => {
    const bookData = {
      id: "book1",
      title: "A Farewell to Arms",
      authors: ["Ernest Hemingway"],
      url: "http://some/url",
      language: "english",
    };

    it("should add the book to entries added", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
        data: { books: [bookData] },
      });

      expect(nextState.entries.added).toHaveProperty("book1");
    });

    it("should remove the book from entries removed if present", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          removed: { book1: true as const },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
        data: { books: [bookData] },
      });

      expect(nextState.entries.removed).not.toHaveProperty("book1");
    });

    it("should update entries current total count", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [],
          baselineTotalCount: 12,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
        data: { books: [bookData] },
      });

      expect(nextState.entries.currentTotalCount).toBe(13);
    });

    it("updates isValid and isModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "Awesome List",
            autoUpdate: false,
          },
        },
        isValid: false,
        isModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
        data: { books: [bookData] },
      });

      expect(nextState.isValid).toBe(true);
      expect(nextState.isModified).toBe(true);
    });
  });

  // ── ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES ────────────────────────────────────

  describe("on ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES", () => {
    const searchResultData = {
      books: [
        {
          id: "book1",
          title: "A Farewell to Arms",
          authors: ["Ernest Hemingway"],
          url: "http://some/url",
          language: "english",
        },
        {
          id: "book2",
          title: "Little Women",
          authors: ["Louisa May Alcott"],
          url: "http://some/url",
          language: "english",
        },
      ],
    };

    it("adds all books in the search results to entries added", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.added).toHaveProperty("book1");
      expect(nextState.entries.added).toHaveProperty("book2");
    });

    it("does not add a book already in entries baseline", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [{ id: "book2", title: "Little Women" }],
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.added).toHaveProperty("book1");
      expect(nextState.entries.added).not.toHaveProperty("book2");
    });

    it("removes books from entries removed if present", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          removed: { book2: true as const },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.removed).not.toHaveProperty("book2");
    });

    it("updates entries current total count", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          baselineTotalCount: 12,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.currentTotalCount).toBe(14); // 12 + 2
    });
  });

  // ── DELETE_CUSTOM_LIST_EDITOR_ENTRY ───────────────────────────────────────

  describe("on DELETE_CUSTOM_LIST_EDITOR_ENTRY", () => {
    it("adds the book to entries removed", () => {
      const nextState = reducer(initialState, {
        type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
      });

      expect(nextState.entries.removed).toHaveProperty("book1");
      expect(nextState.entries.removed["book1"]).toBe(true);
    });

    it("removes book from entries added if present (and does not add to removed)", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          added: {
            book1: {
              id: "book1",
              title: "A Farewell to Arms",
              authors: ["Ernest Hemingway"],
              url: "http://some/url",
              language: "english",
              medium: "",
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
      });

      expect(nextState.entries.added).not.toHaveProperty("book1");
      expect(nextState.entries.removed).not.toHaveProperty("book1");
    });

    it("updates entries current and total count", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          baselineTotalCount: 12,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book91",
      });

      expect(nextState.entries.current).toEqual([
        { id: "book90", title: "Wuthering Heights" },
      ]);
      expect(nextState.entries.currentTotalCount).toBe(11);
    });
  });

  // ── DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES ─────────────────────────────────

  describe("on DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES", () => {
    it("adds all baseline books to entries removed", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
      });

      expect(nextState.entries.removed).toHaveProperty("book91");
      expect(nextState.entries.removed).toHaveProperty("book90");
    });

    it("empties entries added", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          added: {
            book1: {
              id: "book1",
              title: "A Farewell to Arms",
              authors: ["Ernest Hemingway"],
              url: "http://some/url",
              language: "english",
              medium: "",
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
      });

      expect(nextState.entries.added).toEqual({});
    });

    it("updates current entries list and total count", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          baselineTotalCount: 12,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
      });

      expect(nextState.entries.current).toHaveLength(0);
      expect(nextState.entries.currentTotalCount).toBe(10);
    });
  });

  // ── RESET_CUSTOM_LIST_EDITOR ──────────────────────────────────────────────

  describe("on RESET_CUSTOM_LIST_EDITOR", () => {
    it("restores baseline properties", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          baseline: {
            ...initialState.properties.baseline,
            name: "Original Title",
            collections: [1, 2],
          },
          current: {
            ...initialState.properties.current,
            name: "Something Else",
            collections: [3],
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.properties.current.name).toBe("Original Title");
      expect(nextState.properties.current.collections).toEqual([1, 2]);
    });

    it("clears entries added and removed", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          added: {
            book90: { id: "book90", title: "Wuthering Heights" },
            book91: { id: "book91", title: "Huckleberry Finn" },
          },
          removed: { book1: true as const },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.entries.added).toEqual({});
      expect(nextState.entries.removed).toEqual({});
    });

    it("updates isValid and isModified after reset", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          baseline: {
            ...initialState.properties.baseline,
            name: "Original Title",
            collections: [1, 2],
          },
          current: {
            ...initialState.properties.current,
            name: "Something Else",
            collections: [],
          },
        },
        isModified: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.isModified).toBe(false);
    });
  });

  // ── CUSTOM_LIST_SHARE ─────────────────────────────────────────────────────

  describe("on CUSTOM_LIST_SHARE_REQUEST", () => {
    it("sets isSharePending to true if listId matches state id", () => {
      const state = { ...initialState, id: 24 };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`,
        listId: 24,
      });

      expect(nextState.isSharePending).toBe(true);
    });

    it("does nothing if listId does not match state id", () => {
      const state = { ...initialState, id: 24 };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`,
        listId: 77,
      });

      expect(nextState).toBe(state);
    });
  });

  describe("on CUSTOM_LIST_SHARE_SUCCESS", () => {
    it("sets isSharePending to false if listId matches state id", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 24,
      });

      expect(nextState.isSharePending).toBe(false);
    });

    it("sets isShared from list data if listId matches", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 24,
        data: { custom_lists: [{ id: 24, is_shared: true }] },
      });

      expect(nextState.isShared).toBe(true);
    });

    it("does nothing if listId does not match state id", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 77,
      });

      expect(nextState).toBe(state);
    });
  });

  describe("on CUSTOM_LIST_SHARE_FAILURE", () => {
    it("sets isSharePending to false if listId matches state id", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 24,
        error: {},
      });

      expect(nextState.isSharePending).toBe(false);
    });

    it("sets error to the action error message if listId matches", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 24,
        error: { message: "Something is very wrong" },
      });

      expect(nextState.error).toBe("Something is very wrong");
    });

    it("does nothing if listId does not match state id", () => {
      const state = { ...initialState, id: 24, isSharePending: true };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 77,
      });

      expect(nextState).toBe(state);
    });
  });

  // ── getCustomListEditorFormData ────────────────────────────────────────────

  describe("getCustomListEditorFormData", () => {
    it("generates multipart form data from current properties and entries", () => {
      const state = {
        ...initialState,
        id: 123,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "My New List",
            collections: [1, 2],
            autoUpdate: false,
          },
        },
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          current: [
            { id: "book2", title: "Little Women" },
            { id: "book91", title: "Huckleberry Finn" },
          ],
          removed: { book90: true as const },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("id")).toBe("123");
      expect(formData.get("name")).toBe("My New List");
      expect(formData.get("collections")).toBe("[1,2]");
      expect(formData.get("entries")).toBe('[{"id":"book2"}]');
      expect(formData.get("deletedEntries")).toBe('[{"id":"book90"}]');
    });

    it("includes auto_update query if the list is auto updating", () => {
      const state = {
        ...initialState,
        id: 123,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "My New List",
            collections: [1, 2],
            autoUpdate: true,
          },
        },
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "0",
                  key: "title",
                  op: "eq",
                  value: "Little Women",
                },
              },
            },
          },
        },
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          current: [
            { id: "book2", title: "Little Women" },
            { id: "book91", title: "Huckleberry Finn" },
          ],
          removed: { book90: true as const },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("auto_update")).toBe("true");
      expect(formData.get("auto_update_query")).toBe(
        '{"query":{"key":"title","value":"Little Women"}}'
      );
    });

    it("includes auto_update_facets with media and order", () => {
      const state = {
        ...initialState,
        id: 123,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "My New List",
            autoUpdate: true,
          },
        },
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            entryPoint: "Audio",
            sort: "title",
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "0",
                  key: "title",
                  op: "eq",
                  value: "Little Women",
                },
              },
            },
          },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("auto_update_facets")).toBe(
        '{"media":"Audio","order":"title"}'
      );
    });

    it('omits media from auto_update_facets if entryPoint is "All"', () => {
      const state = {
        ...initialState,
        id: 123,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "My New List",
            autoUpdate: true,
          },
        },
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            entryPoint: "All",
            sort: "title",
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "0",
                  key: "title",
                  op: "eq",
                  value: "Little Women",
                },
              },
            },
          },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("auto_update_facets")).toBe('{"order":"title"}');
    });

    it("omits order from auto_update_facets if sort is null", () => {
      const state = {
        ...initialState,
        id: 123,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "My New List",
            autoUpdate: true,
          },
        },
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            entryPoint: "Book",
            sort: null,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "0",
                  key: "title",
                  op: "eq",
                  value: "Little Women",
                },
              },
            },
          },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("auto_update_facets")).toBe('{"media":"Book"}');
    });
  });

  // ── getCustomListEditorSearchUrl ──────────────────────────────────────────

  describe("getCustomListEditorSearchUrl", () => {
    it("generates a search url from the search params", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "Book",
            terms: "foo bar baz",
            sort: "title",
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
          },
        },
      };

      const url = getCustomListEditorSearchUrl(state, "lib");

      expect(url).toBe(
        "/lib/search?language=all&media=Book&order=title&q=foo%20bar%20baz"
      );
    });

    it('omits the media param if entryPoint is "All"', () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "All",
            terms: "foo bar baz",
            sort: "title",
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
          },
        },
      };

      const url = getCustomListEditorSearchUrl(state, "lib");

      expect(url).toBe(
        "/lib/search?language=all&order=title&q=foo%20bar%20baz"
      );
    });

    it("omits the order param if sort is null", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "All",
            terms: "foo bar baz",
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
          },
        },
      };

      const url = getCustomListEditorSearchUrl(state, "lib");

      expect(url).toBe("/lib/search?language=all&q=foo%20bar%20baz");
    });

    it("omits the language param if language is null", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "All",
            terms: "foo bar baz",
            sort: null,
            language: null,
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
          },
        },
      };

      const url = getCustomListEditorSearchUrl(state, "lib");

      expect(url).toBe("/lib/search?q=foo%20bar%20baz");
    });
  });
});
