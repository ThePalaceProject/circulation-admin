import { expect } from "chai";

import reducer, {
  getCustomListEditorFormData,
  getCustomListEditorSearchUrl,
  initialState,
} from "../customListEditor";

import ActionCreator from "../../actions";

describe("custom list editor reducer", () => {
  context("on SET_FEATURE_FLAGS", () => {
    it("sets isAutoUpdateEnabled to true if the enableAutoList feature flag is true", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: {
          enableSomethingElse: false,
          enableAutoList: true,
        },
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(true);
    });

    it("sets isAutoUpdateEnabled to false if the enableAutoList feature flag is false", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: {
          enableSomethingElse: false,
          enableAutoList: false,
        },
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(false);
    });

    it("keeps isAutoUpdateEnabled at the current value if the enableAutoList feature flag is not present", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.SET_FEATURE_FLAGS,
        value: {
          enableSomethingElse: true,
        },
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(true);
    });
  });

  context("on UPDATE_FEATURE_FLAG", () => {
    it("sets isAutoUpdateEnabled to true if the flag name is enableAutoList and the value is true", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_FEATURE_FLAG,
        name: "enableAutoList",
        value: true,
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(true);
    });

    it("sets isAutoUpdateEnabled to false if the flag name is enableAutoList and the value is false", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_FEATURE_FLAG,
        name: "enableAutoList",
        value: false,
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(false);
    });

    it("keeps isAutoUpdateEnabled at the current value if the flag name is not enableAutoList", () => {
      const state = {
        ...initialState,
        isAutoUpdateEnabled: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_FEATURE_FLAG,
        name: "enableSomethingElse",
        value: false,
      });

      expect(nextState.isAutoUpdateEnabled).to.equal(true);
    });
  });

  context("on OPEN_CUSTOM_LIST_EDITOR", () => {
    const state = undefined;

    const listData = {
      custom_lists: [
        {
          collections: [
            {
              id: 16,
              name: "TEST Baker & Taylor",
              protocol: "Axis 360",
            },
          ],
          entry_count: 150,
          id: 17,
          name: "Baker & Taylor Axis360 Test",
        },
        {
          collections: [],
          entry_count: 15,
          id: 12,
          name: "Cooking",
        },
        {
          collections: [],
          entry_count: 16,
          id: 19,
          name: "LCP PDF Test",
        },
      ],
    };

    it("sets the id, and obtains the name, collections, and baselineTotalCount from the list data", () => {
      const nextState = reducer(state, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: "17",
        data: listData,
      });

      expect(nextState.id).to.equal(17);
      expect(nextState.entries.baselineTotalCount).to.equal(150);
      expect(nextState.properties.current).to.deep.equal(
        nextState.properties.baseline
      );

      expect(nextState.properties.baseline).to.deep.equal({
        name: "Baker & Taylor Axis360 Test",
        collections: [16],
        autoUpdate: false,
      });

      expect(nextState.error).to.equal(null);
    });

    it("sets an error message when no list with the id in the action exists in the data", () => {
      const nextState = reducer(state, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: "999",
        data: listData,
      });

      expect(nextState.id).to.equal(999);
      expect(nextState.error).to.equal("Custom list not found for ID: 999");
    });

    it("sets the id to null when the id in the action is null", () => {
      const nextState = reducer(state, {
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: null,
        data: listData,
      });

      expect(nextState.id).to.equal(null);
      expect(nextState.error).to.equal(null);
    });
  });

  context(`on ${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`, () => {
    const listData = {
      custom_lists: [
        {
          collections: [
            {
              id: 16,
              name: "TEST Baker & Taylor",
              protocol: "Axis 360",
            },
          ],
          entry_count: 150,
          id: 17,
          name: "Baker & Taylor Axis360 Test",
        },
        {
          collections: [],
          entry_count: 15,
          id: 12,
          name: "Cooking",
        },
        {
          collections: [
            {
              id: 14,
              name: "New BiblioBoard Test",
              protocol: "OPDS for Distributors",
            },
          ],
          entry_count: 13337,
          id: 18,
          is_owner: true,
          is_shared: false,
          name: "New BiblioBoard",
        },
        {
          collections: [],
          id: 31,
          name: "Auto Updating List",
          auto_update: true,
          auto_update_query:
            '{"query":{"and":[{"and":[{"or":[{"key":"genre","value":"Horror"},{"key":"genre","value":"Fantasy"}]},{"key":"language","value":"eng"},{"key":"classification","value":"mystery"}]},{"not":[{"or":[{"key":"author","op":"contains","value":"bracken"},{"key":"title","value":"wicked appetite"}]}]}]}}',
        },
        {
          collections: [],
          id: 42,
          name: "Another Auto Updating List",
          auto_update: true,
          auto_update_facets: '{"media":"Audio","order":"title"}',
        },
      ],
    };

    it("obtains the name, ownership flag, sharing flag, collections, and baselineTotalCount from the list data for the current id", () => {
      const state = {
        ...initialState,
        id: 18,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(nextState.id).to.equal(18);
      expect(nextState.isOwner).to.equal(true);
      expect(nextState.isShared).to.equal(false);
      expect(nextState.entries.baselineTotalCount).to.equal(13337);
      expect(nextState.properties.current).to.deep.equal(
        nextState.properties.baseline
      );

      expect(nextState.properties.baseline).to.deep.equal({
        name: "New BiblioBoard",
        collections: [14],
        autoUpdate: false,
      });

      expect(nextState.error).to.equal(null);
    });

    it("sets isLoaded to true when a list with the current id exists in the data", () => {
      const state = {
        ...initialState,
        id: 18,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(nextState.isLoaded).to.equal(true);
    });

    it("sets an error message when no list with the current id exists in the data", () => {
      const state = {
        ...initialState,
        id: 999,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(nextState.error).to.equal("Custom list not found for ID: 999");
    });

    it("updates the advanced search builders when there is a saved search query", () => {
      const state = {
        ...initialState,
        id: 31,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "1",
        and: [
          {
            id: "2",
            or: [
              {
                id: "3",
                key: "genre",
                op: "eq",
                value: "Horror",
              },
              {
                id: "4",
                key: "genre",
                op: "eq",
                value: "Fantasy",
              },
            ],
          },
          {
            id: "5",
            key: "language",
            op: "eq",
            value: "eng",
          },
          {
            id: "6",
            key: "classification",
            op: "eq",
            value: "mystery",
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.exclude.query
      ).to.deep.equal({
        id: "8",
        or: [
          {
            id: "9",
            key: "author",
            op: "contains",
            value: "bracken",
          },
          {
            id: "10",
            key: "title",
            op: "eq",
            value: "wicked appetite",
          },
        ],
      });
    });

    it("updates the search params when there are saved search facets", () => {
      const state = {
        ...initialState,
        id: 42,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(nextState.searchParams.current.entryPoint).to.equal("Audio");
      expect(nextState.searchParams.current.sort).to.equal("title");
    });

    it("ignores the action if its isAfterShare property is true", () => {
      const state = {
        ...initialState,
        id: 18,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
        isAfterShare: true,
      });

      expect(nextState).to.equal(state);
    });

    it("sets isSearchModified and isModified to false", () => {
      const state = {
        ...initialState,
        id: 42,
        isSearchModified: true,
        isModified: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
        data: listData,
      });

      expect(nextState.isSearchModified).to.equal(false);
      expect(nextState.isModified).to.equal(false);
    });

    context("when auto update is enabled", () => {
      it("defaults the autoUpdate property to true for a new list", () => {
        const state = {
          ...initialState,
          isAutoUpdateEnabled: true,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(true);
      });

      it("sets the autoUpdate property to true if the auto_update setting in the data is true", () => {
        const state = {
          ...initialState,
          id: 31,
          isAutoUpdateEnabled: true,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(true);
      });

      it("sets the autoUpdate property to false if the auto_update setting in the data is not present", () => {
        const state = {
          ...initialState,
          id: 12,
          isAutoUpdateEnabled: true,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(false);
      });
    });

    context("when auto update is disabled", () => {
      it("defaults the autoUpdate property to false for a new list", () => {
        const state = {
          ...initialState,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(false);
      });

      it("sets the autoUpdate property to false if the auto_update setting in the data is not present", () => {
        const state = {
          ...initialState,
          id: 16,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(false);
      });

      it("sets the autoUpdate property to false even if the list data has auto_update set to true", () => {
        const state = {
          ...initialState,
          id: 31,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
          data: listData,
        });

        expect(nextState.properties.current.autoUpdate).to.equal(false);
      });
    });
  });

  context(
    `on ${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.LOAD}`,
    () => {
      const listDetailsData = {
        books: [
          { id: "book1", title: "A Farewell to Arms" },
          { id: "book2", title: "Little Women" },
        ],
      };

      it("updates the baseline entries with the books in the list details data", () => {
        const state = {
          ...initialState,
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.LOAD}`,
          data: listDetailsData,
        });

        expect(nextState.entries.baseline).to.deep.equal(listDetailsData.books);
      });

      it("applies the current delta to the books in the list details data", () => {
        const state = {
          ...initialState,
          entries: {
            ...initialState.entries,
            baselineTotalCount: 5,
            added: {
              book90: { id: "book90", title: "Wuthering Heights" },
              book91: { id: "book91", title: "Huckleberry Finn" },
            },
            removed: {
              book1: true as const,
            },
          },
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.LOAD}`,
          data: listDetailsData,
        });

        expect(nextState.entries.baseline).to.deep.equal(listDetailsData.books);

        expect(nextState.entries.current).to.deep.equal([
          { id: "book91", title: "Huckleberry Finn" },
          { id: "book90", title: "Wuthering Heights" },
          { id: "book2", title: "Little Women" },
        ]);

        expect(nextState.entries.currentTotalCount).to.equal(6); // 5 + 2 - 1
      });
    }
  );

  context(
    `on ${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`,
    () => {
      const listDetailsData = {
        books: [
          { id: "book1", title: "A Farewell to Arms" },
          { id: "book2", title: "Little Women" },
        ],
      };

      it("appends the books in the list details data to the baseline entries", () => {
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
          type: `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`,
          data: listDetailsData,
        });

        expect(nextState.entries.baseline).to.deep.equal([
          { id: "book91", title: "Huckleberry Finn" },
          { id: "book90", title: "Wuthering Heights" },
          { id: "book1", title: "A Farewell to Arms" },
          { id: "book2", title: "Little Women" },
        ]);
      });

      it("applies the current delta to the new baseline entries", () => {
        const state = {
          ...initialState,
          entries: {
            ...initialState.entries,
            baseline: [
              { id: "book91", title: "Huckleberry Finn" },
              { id: "book90", title: "Wuthering Heights" },
            ],
            baselineTotalCount: 4,
            added: {
              book98: { id: "book98", title: "The Bell Jar" },
            },
            removed: {
              book1: true as const,
              book90: true as const,
            },
          },
        };

        const nextState = reducer(state, {
          type: `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`,
          data: listDetailsData,
        });

        expect(nextState.entries.current).to.deep.equal([
          { id: "book98", title: "The Bell Jar" },
          { id: "book91", title: "Huckleberry Finn" },
          { id: "book2", title: "Little Women" },
        ]);

        expect(nextState.entries.currentTotalCount).to.equal(3); // 4 + 1 - 2
      });
    }
  );

  context("on UPDATE_CUSTOM_LIST_EDITOR_PROPERTY", () => {
    const state = {
      ...initialState,
    };

    it("updates the current properties with the name/value", () => {
      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "name",
        value: "Awesome List",
      });

      expect(nextState.properties.current.name).to.equal("Awesome List");
    });

    it("updates isValid and isModified", () => {
      let nextState;

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "name",
        value: "Awesome List",
      });

      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(false);

      nextState = reducer(nextState, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "collections",
        value: [12],
      });

      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(true);

      nextState = reducer(nextState, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "name",
        value: "",
      });

      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(false);

      nextState = reducer(nextState, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "collections",
        value: [],
      });

      expect(nextState.isModified).to.equal(false);
      expect(nextState.isValid).to.equal(false);

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
        name: "autoUpdate",
        value: true,
      });

      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(false);
    });
  });

  context("on TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION", () => {
    it("adds the id to the current collection property if it doesn't exist", () => {
      const state = {
        ...initialState,
      };

      const nextState = reducer(state, {
        type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
        id: 13,
      });

      expect(nextState.properties.current.collections).to.deep.equal([13]);
    });

    it("removes the id from the current collection property if it exists", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            collections: [10, 11, 12],
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
        id: 11,
      });

      expect(nextState.properties.current.collections).to.deep.equal([10, 12]);
    });

    it("updates isValid and isModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "List 1",
            collections: [],
          },
        },
        isValid: false,
        isModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
        id: 11,
      });

      expect(nextState.isValid).to.equal(true);
      expect(nextState.isModified).to.equal(true);
    });
  });

  context("on UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM", () => {
    const state = {
      ...initialState,
      properties: {
        ...initialState.properties,
        current: {
          ...initialState.properties.current,
          autoUpdate: true,
        },
      },
    };

    it("updates searchParams with the name/value", () => {
      let nextState;

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "entryPoint",
        value: "Book",
      });

      expect(nextState.searchParams.current.entryPoint).to.equal("Book");

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "terms",
        value: "foo bar",
      });

      expect(nextState.searchParams.current.terms).to.equal("foo bar");

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "sort",
        value: "title",
      });

      expect(nextState.searchParams.current.sort).to.equal("title");

      nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "language",
        value: "eng",
      });

      expect(nextState.searchParams.current.language).to.equal("eng");
    });

    it("updates isValid, isModified, and isSearchModified", () => {
      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
        name: "entryPoint",
        value: "Book",
      });

      expect(nextState.isSearchModified).to.equal(true);
      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(false);
    });
  });

  context("on ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY", () => {
    const valueQuery = {
      key: "title",
      op: "contains",
      value: "Frankenstein",
    };

    it("should add the query to the currently selected query", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
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
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
                selectedQueryId: "90",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        and: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "92",
            key: "title",
            value: "bar",
          },
          {
            id: "33",
            ...valueQuery,
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("90");
    });

    it("should add the query as the root query and select it, if there is no existing root query", () => {
      const state = {
        ...initialState,
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "34",
        ...valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("34");
    });

    it("should add the query to the root query, if there is no selected query", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        and: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "92",
            key: "title",
            value: "bar",
          },
          {
            id: "35",
            ...valueQuery,
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal(null);
    });

    it("should create a boolean AND query if a new query is added to a non-boolean root query in the include builder", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "91",
                  key: "title",
                  value: "foo",
                },
                selectedQueryId: "91",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "91",
        and: [
          {
            id: "37",
            key: "title",
            value: "foo",
          },
          {
            id: "36",
            ...valueQuery,
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("91");
    });

    it("should create a boolean OR query if a new query is added to a non-boolean root query in the exclude builder", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              exclude: {
                ...initialState.searchParams.current.advanced.exclude,
                query: {
                  id: "91",
                  key: "title",
                  value: "foo",
                },
                selectedQueryId: "91",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "exclude",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.exclude.query
      ).to.deep.equal({
        id: "91",
        or: [
          {
            id: "39",
            key: "title",
            value: "foo",
          },
          {
            id: "38",
            ...valueQuery,
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.exclude.selectedQueryId
      ).to.equal("91");
    });

    it("should create a boolean query that is the opposite of the parent if a new query is added to a non-boolean query", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
                selectedQueryId: "92",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        and: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "92",
            or: [
              {
                id: "41",
                key: "title",
                value: "bar",
              },
              {
                id: "40",
                ...valueQuery,
              },
            ],
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("92");
    });

    it("updates isValid, isModified, and isSearchModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "List 1",
            autoUpdate: true,
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        query: valueQuery,
      });

      expect(nextState.isSearchModified).to.equal(true);
      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(true);
    });
  });

  context("on UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN", () => {
    const include = {
      query: {
        id: "90",
        and: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "92",
            key: "title",
            value: "bar",
          },
        ],
      },
      selectedQueryId: "92",
    };

    const state = {
      ...initialState,
      searchParams: {
        ...initialState.searchParams,
        baseline: {
          ...initialState.searchParams.baseline,
          advanced: {
            ...initialState.searchParams.baseline.advanced,
            include: {
              ...initialState.searchParams.baseline.advanced.include,
              ...include,
            },
          },
        },
        current: {
          ...initialState.searchParams.current,
          advanced: {
            ...initialState.searchParams.current.advanced,
            include: {
              ...initialState.searchParams.current.advanced.include,
              ...include,
            },
          },
        },
      },
    };

    it("should change the boolean operator on the specified query", () => {
      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN,
        builderName: "include",
        id: "90",
        bool: "or",
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        or: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "92",
            key: "title",
            value: "bar",
          },
        ],
      });
    });

    it("should do nothing if the id does not refer to a boolean query", () => {
      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN,
        builderName: "include",
        id: "92",
        bool: "or",
      });

      expect(nextState).to.deep.equal(state);
    });

    it("should do nothing if the id does not refer any query", () => {
      const nextState = reducer(state, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN,
        builderName: "include",
        id: "234",
        bool: "or",
      });

      expect(nextState).to.deep.equal(state);
    });

    it("updates isValid, isModified, and isSearchModified", () => {
      const namedState = {
        ...state,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "List 1",
            autoUpdate: true,
          },
        },
      };

      const nextState = reducer(namedState, {
        type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN,
        builderName: "include",
        id: "90",
        bool: "or",
      });

      expect(nextState.isSearchModified).to.equal(true);
      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(true);
    });
  });

  context("on MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY", () => {
    const state = {
      ...initialState,
      searchParams: {
        ...initialState.searchParams,
        current: {
          ...initialState.searchParams.current,
          advanced: {
            ...initialState.searchParams.current.advanced,
            include: {
              ...initialState.searchParams.current.advanced.include,
              query: {
                id: "90",
                and: [
                  {
                    id: "91",
                    or: [
                      {
                        id: "92",
                        key: "title",
                        value: "foo",
                      },
                      {
                        id: "93",
                        key: "title",
                        value: "bar",
                      },
                      {
                        id: "94",
                        key: "title",
                        value: "baz",
                      },
                    ],
                  },
                  {
                    id: "95",
                    or: [
                      {
                        id: "96",
                        key: "author",
                        value: "alice",
                      },
                      {
                        id: "97",
                        key: "author",
                        value: "ben",
                      },
                    ],
                  },
                ],
              },
              selectedQueryId: "92",
            },
          },
        },
      },
    };

    it("should add the specified query to the target, and remove it from its current parent", () => {
      const nextState = reducer(state, {
        type: ActionCreator.MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
        targetId: "95",
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        and: [
          {
            id: "91",
            or: [
              {
                id: "93",
                key: "title",
                value: "bar",
              },
              {
                id: "94",
                key: "title",
                value: "baz",
              },
            ],
          },
          {
            id: "95",
            or: [
              {
                id: "96",
                key: "author",
                value: "alice",
              },
              {
                id: "97",
                key: "author",
                value: "ben",
              },
              {
                id: "43",
                key: "title",
                value: "foo",
              },
            ],
          },
        ],
      });
    });

    it("updates isValid, isModified, isSearchModified", () => {
      const namedState = {
        ...state,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "List 1",
            autoUpdate: true,
          },
        },
      };

      const nextState = reducer(namedState, {
        type: ActionCreator.MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
        targetId: "95",
      });

      expect(nextState.isSearchModified).to.equal(true);
      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(true);
    });
  });

  context("on REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY", () => {
    it("should remove the specified query", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                    {
                      id: "93",
                      key: "title",
                      value: "baz",
                    },
                  ],
                },
                selectedQueryId: "92",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "90",
        and: [
          {
            id: "91",
            key: "title",
            value: "foo",
          },
          {
            id: "93",
            key: "title",
            value: "baz",
          },
        ],
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("90");
    });

    it("should remove the parent boolean, if there is only one remaining child after the specified query is removed", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
                selectedQueryId: "92",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "91",
        key: "title",
        value: "foo",
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal(undefined);
    });

    it("updates isValid, isModified, and isSearchModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          current: {
            ...initialState.properties.current,
            name: "List 1",
          },
        },
        searchParams: {
          ...initialState.searchParams,
          baseline: {
            ...initialState.searchParams.baseline,
            advanced: {
              ...initialState.searchParams.baseline.advanced,
              include: {
                ...initialState.searchParams.baseline.advanced.include,
                query: {
                  id: "92",
                  key: "title",
                  value: "bar",
                },
                selectedQueryId: "92",
              },
            },
          },
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "92",
                  key: "title",
                  value: "bar",
                },
                selectedQueryId: "92",
              },
            },
          },
        },
        isModified: false,
        isValid: true,
      };

      const nextState = reducer(state, {
        type: ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
      });

      expect(nextState.isSearchModified).to.equal(true);
      expect(nextState.isModified).to.equal(true);
      expect(nextState.isValid).to.equal(false);
    });
  });

  context("on SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY", () => {
    it("should select the specified query", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
                selectedQueryId: "92",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "91",
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal("91");
    });

    it("should remove the parent boolean, if there is only one remaining child after the specified query is removed", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            ...initialState.searchParams.current,
            advanced: {
              ...initialState.searchParams.current.advanced,
              include: {
                ...initialState.searchParams.current.advanced.include,
                query: {
                  id: "90",
                  and: [
                    {
                      id: "91",
                      key: "title",
                      value: "foo",
                    },
                    {
                      id: "92",
                      key: "title",
                      value: "bar",
                    },
                  ],
                },
                selectedQueryId: "92",
              },
            },
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
        builderName: "include",
        id: "92",
      });

      expect(
        nextState.searchParams.current.advanced.include.query
      ).to.deep.equal({
        id: "91",
        key: "title",
        value: "foo",
      });

      expect(
        nextState.searchParams.current.advanced.include.selectedQueryId
      ).to.equal(undefined);
    });
  });

  context("on ADD_CUSTOM_LIST_EDITOR_ENTRY", () => {
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

    it("should add the book to entries added", () => {
      const state = {
        ...initialState,
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book2",
        data: searchResultData,
      });

      expect(nextState.entries.added)
        .to.have.property("book2")
        .that.deep.equals({
          id: "book2",
          title: "Little Women",
          authors: ["Louisa May Alcott"],
          url: "http://some/url",
          language: "english",
          medium: "",
        });
    });

    it("should not add the book to entries added if it already exists in entries baseline", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [{ id: "book2", title: "Little Women" }],
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book2",
        data: searchResultData,
      });

      expect(nextState.entries.added).not.to.have.property("book2");
    });

    it("should remove the book from entries removed, if it is present", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          removed: {
            book2: true as const,
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book2",
        data: searchResultData,
      });

      expect(nextState.entries.removed).not.to.have.property("book2");
    });

    it("should apply the new delta to the baseline and update entries current", () => {
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
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book2",
        data: searchResultData,
      });

      expect(nextState.entries.current).to.deep.equal([
        {
          id: "book2",
          title: "Little Women",
          authors: ["Louisa May Alcott"],
          url: "http://some/url",
          language: "english",
          medium: "",
        },
        { id: "book91", title: "Huckleberry Finn" },
        { id: "book90", title: "Wuthering Heights" },
      ]);

      expect(nextState.entries.currentTotalCount).to.equal(13); // 12 + 1
    });

    it("should update isValid and isModified", () => {
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
        id: "book2",
        data: searchResultData,
      });

      expect(nextState.isValid).to.equal(true);
      expect(nextState.isModified).to.equal(true);
    });
  });

  context("on ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES", () => {
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

    it("should add all books in the search results data to entries added", () => {
      const state = {
        ...initialState,
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.added).to.deep.equal({
        book1: {
          id: "book1",
          title: "A Farewell to Arms",
          authors: ["Ernest Hemingway"],
          url: "http://some/url",
          language: "english",
          medium: "",
        },
        book2: {
          id: "book2",
          title: "Little Women",
          authors: ["Louisa May Alcott"],
          url: "http://some/url",
          language: "english",
          medium: "",
        },
      });
    });

    it("should not add a book to entries added if it already exists in entries baseline", () => {
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

      expect(nextState.entries.added).to.have.property("book1");
      expect(nextState.entries.added).not.to.have.property("book2");
    });

    it("should remove a book from entries removed, if it is present", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          removed: {
            book2: true as const,
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.entries.removed).not.to.have.property("book2");
    });

    it("should apply the new delta to the baseline and update entries current", () => {
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

      expect(nextState.entries.current).to.deep.equal([
        {
          id: "book2",
          title: "Little Women",
          authors: ["Louisa May Alcott"],
          url: "http://some/url",
          language: "english",
          medium: "",
        },
        {
          id: "book1",
          title: "A Farewell to Arms",
          authors: ["Ernest Hemingway"],
          url: "http://some/url",
          language: "english",
          medium: "",
        },
        { id: "book91", title: "Huckleberry Finn" },
        { id: "book90", title: "Wuthering Heights" },
      ]);

      expect(nextState.entries.currentTotalCount).to.equal(14); // 12 + 2
    });

    it("should update isValid and isModified", () => {
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
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: searchResultData,
      });

      expect(nextState.isValid).to.equal(true);
      expect(nextState.isModified).to.equal(true);
    });
  });

  context("on DELETE_CUSTOM_LIST_EDITOR_ENTRY", () => {
    it("should add the book to entries removed", () => {
      const state = {
        ...initialState,
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book1",
      });

      expect(nextState.entries.removed)
        .to.have.property("book1")
        .that.equals(true);
    });

    it("should delete the book from entries added, if it is present", () => {
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

      expect(nextState.entries.added).not.to.have.property("book1");
      expect(nextState.entries.removed).not.to.have.property("book1");
    });

    it("should apply the new delta to the baseline and update entries current", () => {
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

      expect(nextState.entries.current).to.deep.equal([
        { id: "book90", title: "Wuthering Heights" },
      ]);

      expect(nextState.entries.currentTotalCount).to.equal(11); // 12 - 1
    });

    it("should update isValid and isModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          baseline: {
            ...initialState.properties.baseline,
            name: "Awesome List",
          },
          current: {
            ...initialState.properties.current,
            name: "Awesome List",
          },
        },
        entries: {
          ...initialState.entries,
          baseline: [{ id: "book91", title: "Huckleberry Finn" }],
          baselineTotalCount: 1,
          current: [{ id: "book91", title: "Huckleberry Finn" }],
          currentTotalCount: 1,
        },
        isValid: true,
        isModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
        id: "book91",
      });

      expect(nextState.isValid).to.equal(false);
      expect(nextState.isModified).to.equal(true);
    });
  });

  context("on DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES", () => {
    it("should add all books in baseline entries to entries removed", () => {
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

      expect(nextState.entries.removed)
        .to.have.property("book91")
        .that.equals(true);
      expect(nextState.entries.removed)
        .to.have.property("book90")
        .that.equals(true);
    });

    it("should empty entries added", () => {
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

      expect(nextState.entries.added).to.deep.equal({});
    });

    it("should apply the new delta to the baseline and update entries current", () => {
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

      expect(nextState.entries.current).to.have.length(0);
      expect(nextState.entries.currentTotalCount).to.equal(10); // 12 - 2
    });

    it("should update isValid and isModified", () => {
      const state = {
        ...initialState,
        properties: {
          ...initialState.properties,
          baseline: {
            ...initialState.properties.baseline,
            name: "Awesome List",
          },
          current: {
            ...initialState.properties.current,
            name: "Awesome List",
          },
        },
        entries: {
          ...initialState.entries,
          baseline: [{ id: "book91", title: "Huckleberry Finn" }],
          baselineTotalCount: 1,
          current: [{ id: "book91", title: "Huckleberry Finn" }],
          currentTotalCount: 1,
        },
        isValid: true,
        isModified: false,
      };

      const nextState = reducer(state, {
        type: ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
      });

      expect(nextState.isValid).to.equal(false);
      expect(nextState.isModified).to.equal(true);
    });
  });

  context("on RESET_CUSTOM_LIST_EDITOR", () => {
    it("should restore baseline properties", () => {
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

      expect(nextState.properties.current)
        .to.have.property("name")
        .that.equals("Original Title");

      expect(nextState.properties.current)
        .to.have.property("collections")
        .that.deep.equals([1, 2]);
    });

    it("should clear entries added and removed", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          added: {
            book90: { id: "book90", title: "Wuthering Heights" },
            book91: { id: "book91", title: "Huckleberry Finn" },
          },
          removed: {
            book1: true as const,
          },
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.entries.added).to.deep.equal({});
      expect(nextState.entries.removed).to.deep.equal({});
    });

    it("should apply the new delta to the baseline and update entries current", () => {
      const state = {
        ...initialState,
        entries: {
          ...initialState.entries,
          baseline: [
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          baselineTotalCount: 12,
          added: {
            book2: {
              id: "book2",
              title: "Little Women",
              authors: ["Louisa May Alcott"],
              url: "http://some/url",
              language: "english",
              medium: "",
            },
          },
          removed: {
            book1: true as const,
            book3: true as const,
          },
          current: [
            { id: "book2", title: "Little Women" },
            { id: "book91", title: "Huckleberry Finn" },
            { id: "book90", title: "Wuthering Heights" },
          ],
          currentTotalCount: 11,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.entries.current).to.deep.equal([
        { id: "book91", title: "Huckleberry Finn" },
        { id: "book90", title: "Wuthering Heights" },
      ]);

      expect(nextState.entries.currentTotalCount).to.equal(12);
    });

    it("should update isValid and isModified", () => {
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
          isValid: false,
          isModified: true,
        },
      };

      const nextState = reducer(state, {
        type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
      });

      expect(nextState.isValid).to.equal(true);
      expect(nextState.isModified).to.equal(false);
    });
  });

  context("on CUSTOM_LIST_SHARE_REQUEST", () => {
    it("should set isSharePending to true if the listId in the action is the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`,
        listId: 24,
      });

      expect(nextState.isSharePending).to.equal(true);
    });

    it("should do nothing if the listId in the action is not the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`,
        listId: 77,
      });

      expect(nextState).to.equal(state);
    });
  });

  context("on CUSTOM_LIST_SHARE_SUCCESS", () => {
    it("should set isSharePending to false if the listId in the action is the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 24,
      });

      expect(nextState.isSharePending).to.equal(false);
    });

    it("should set isShared to the value in the list data if the listId in the action is the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 24,
        data: {
          custom_lists: [
            {
              id: 24,
              is_shared: true,
            },
          ],
        },
      });

      expect(nextState.isShared).to.equal(true);
    });

    it("should do nothing if the listId in the action is not the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
        listId: 77,
      });

      expect(nextState).to.equal(state);
    });
  });

  context("on CUSTOM_LIST_SHARE_FAILURE", () => {
    it("should set isSharePending to false if the listId in the action is the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 24,
        error: {},
      });

      expect(nextState.isSharePending).to.equal(false);
    });

    it("should set error to the action's error message if listId in the action is the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 24,
        error: {
          message: "Something is very wrong",
        },
      });

      expect(nextState.error).to.equal("Something is very wrong");
    });

    it("should do nothing if the listId in the action is not the id in state", () => {
      const state = {
        ...initialState,
        id: 24,
        isSharePending: true,
      };

      const nextState = reducer(state, {
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
        listId: 77,
      });

      expect(nextState).to.equal(state);
    });
  });

  context("getCustomListEditorFormData", () => {
    it("should generate multipart form data from the current properties and entries", () => {
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
          removed: {
            book90: true as const,
          },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("id")).to.equal("123");
      expect(formData.get("name")).to.equal("My New List");
      expect(formData.get("collections")).to.equal("[1,2]");
      expect(formData.get("entries")).to.equal(
        '[{"id":"book2","title":"Little Women"},{"id":"book91","title":"Huckleberry Finn"}]'
      );
      expect(formData.get("deletedEntries")).to.equal(
        '[{"id":"book90","title":"Wuthering Heights"}]'
      );
    });

    it("should include an auto update query if the list is auto updating", () => {
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
          removed: {
            book90: true as const,
          },
        },
      };

      const formData = getCustomListEditorFormData(state);

      expect(formData.get("id")).to.equal("123");
      expect(formData.get("name")).to.equal("My New List");
      expect(formData.get("collections")).to.equal("[1,2]");
      expect(formData.get("auto_update")).to.equal("true");
      expect(formData.get("auto_update_query")).to.equal(
        '{"query":{"key":"title","value":"Little Women"}}'
      );
    });

    it("should include auto update facets if the list is auto updating", () => {
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

      expect(formData.get("auto_update_facets")).to.equal(
        '{"media":"Audio","order":"title"}'
      );
    });

    it('should not include media in auto update facets if entryPoint is "All"', () => {
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

      expect(formData.get("auto_update_facets")).to.equal('{"order":"title"}');
    });

    it("should not include order in auto update facets if sort is null", () => {
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

      expect(formData.get("auto_update_facets")).to.equal('{"media":"Book"}');
    });
  });

  context("getCustomListEditorSearchUrl", () => {
    it("should generate a search url from the search params", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "Book",
            terms: "foo bar baz",
            sort: "title",
            language: "eng",
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

      const library = "lib";
      const url = getCustomListEditorSearchUrl(state, library);

      expect(url).to.equal(
        "/lib/search?media=Book&order=title&q=foo%20bar%20baz"
      );
    });

    it('should omit the media param if entryPoint is "All"', () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "All",
            terms: "foo bar baz",
            sort: "title",
            language: "eng",
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

      const library = "lib";
      const url = getCustomListEditorSearchUrl(state, library);

      expect(url).to.equal("/lib/search?order=title&q=foo%20bar%20baz");
    });

    it("should omit the order param if sort is null", () => {
      const state = {
        ...initialState,
        searchParams: {
          ...initialState.searchParams,
          current: {
            entryPoint: "All",
            terms: "foo bar baz",
            sort: null,
            language: "eng",
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

      const library = "lib";
      const url = getCustomListEditorSearchUrl(state, library);

      expect(url).to.equal("/lib/search?q=foo%20bar%20baz");
    });

    it("should omit the language param if language is null", () => {
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

      const library = "lib";
      const url = getCustomListEditorSearchUrl(state, library);

      expect(url).to.equal("/lib/search?q=foo%20bar%20baz");
    });
  });
});
