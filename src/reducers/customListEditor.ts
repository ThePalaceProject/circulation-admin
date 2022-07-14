import produce from "immer";
import { BookData } from "opds-web-client/lib/interfaces";
import { getMedium } from "opds-web-client/lib/utils/book";
import ActionCreator from "../actions";

export interface Entry extends BookData {
  medium?: string;
}

/**
 * Information about the entries in a list that is being edited.
 */
export interface CustomListEditorEntriesData {
  /**
   * The visible entries in the list, when the last was last saved. This can be used to restore
   * the editor to the last save point, and to detect changes since the last save. Note that this
   * does not necessarily contain all of the entries, but only the entries in the pages that have
   * been retrieved from the CM.
   */
  baseline: Entry[];

  /**
   * The total number of entries in the list, when the list was last saved. This can be used when
   * restoring the editor to the last save point. This reflects the total number of entries in the
   * list (as reported by the CM), not just the number of visible ones from the pages that have
   * been retrieved. As such, it may be greater than baseline.length.
   */
  baselineTotalCount: number;

  /**
   * The entries that have been added to the list since the last save, keyed by id. This is stored
   * as a delta, so that it can be reapplied to the baseline, if/when baseline is updated from the
   * CM.
   */
  added: Record<string, Entry>;

  /**
   * The entries that have been removed from the list since the last save, keyed by id. This is
   * stored as a delta, so that it can be reapplied to the baseline, if/when baseline is updated
   * from the CM.
   */
  removed: Record<string, true>;

  /**
   * The currently visible entries in the list, computed by applying the delta to the baseline.
   * This is purely derived from baseline, added, and removed, but is stored here as a convenience/
   * optimization, so that view components will not need to perform a potentially expensive
   * computation when rendering. Note that like baseline, this list contains only the entries in
   * pages that have been retrieved from the CM (plus any entries added by the user since the last
   * save), which is not necessarily all of the current entries in the list.
   */
  current: Entry[];

  /**
   * The current number of entries in the list, since the last save. This is derived from
   * baselineTotalCount, added, and removed. It is stored here as a convenience, so that view
   * components won't have to compute the value when rendering.
   */
  currentTotalCount: number;
}

/**
 * Properties of the custom list.
 */
export interface CustomListEditorProperties {
  /**
   * The name (title) of the list.
   */
  name: string;

  /**
   * The ids of collections that should be used to automatically populate the list.
   */
  collections: (string | number)[];
}

/**
 * Properties of the custom list, tracked since the last save.
 */
export interface CustomListEditorTrackedProperties {
  /**
   * The properties of the list, when the list was last saved. This can be used to restore the
   * editor to the last save point, and to detect changes since the last save.
   */
  baseline: CustomListEditorProperties;

  /**
   * The current properties of the list, since the last save.
   */
  current: CustomListEditorProperties;
}

/**
 * Search parameters.
 */
export interface CustomListEditorSearchParams {
  /**
   * The entry point of the search, e.g. ebooks, audiobooks.
   */
  entryPoint: string;

  /**
   * The terms to search for.
   */
  terms: string;

  /**
   * The desired sort order of search results.
   */
  sort: string;

  /**
   * The desired language of search results.
   */
  language: string;
}

/**
 * The state of the custom list editor.
 */
export interface CustomListEditorState {
  /**
   * The id of the list being edited. This can be null, if this is a new list.
   */
  id: number;

  /**
   * The properties of the list.
   */
  properties: CustomListEditorTrackedProperties;

  /**
   * The parameters to use when searching on the custom list editor.
   */
  searchParams: CustomListEditorSearchParams;

  /**
   * The entries in the list.
   */
  entries: CustomListEditorEntriesData;

  /**
   * The validity of the list; true if the list is valid, false otherwise. This is derived from
   * properties and entries. It is stored here as a convenience, so that view components won't need
   * to compute the validity when rendering.
   */
  isValid: boolean;

  /**
   * The modified state of the list; true if the list has been changed since the last save, false
   * otherwise. This is derived from properties and entries. It is stored here as a convenience, so
   * that view components won't need to make the determination when rendering.
   */
  isModified: boolean;

  /**
   * An error message, if an error has occurred.
   */
  error: string;
}

/**
 * The initial state. Provides defaults for a new list.
 */
export const initialState: CustomListEditorState = {
  id: null,
  properties: {
    baseline: {
      name: "",
      collections: [],
    },
    current: {
      name: "",
      collections: [],
    },
  },
  searchParams: {
    entryPoint: "All",
    terms: "",
    sort: null,
    language: "all",
  },
  entries: {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  },
  isValid: false,
  isModified: false,
  error: null,
};

/**
 * Determines if a custom list editor contains valid current data, given its state. A list is valid
 * if it has a name, and has either: at least one source collection, or at least one entry.
 *
 * @param state The custom list editor state
 * @returns     true if the editor contains valid data, false otherwise
 */
const isValid = (state: CustomListEditorState): boolean => {
  const { properties, entries } = state;
  const { name, collections } = properties.current;
  const { currentTotalCount } = entries;

  return !!name && (collections.length > 0 || currentTotalCount > 0);
};

/**
 * Determines if a custom list editor contains data has been modified since it was last saved,
 * given its state.
 *
 * @param state The custom list editor state
 * @returns     true if the editor has been modified since last save, false otherwise
 */
const isModified = (state: CustomListEditorState): boolean => {
  const { properties, entries } = state;
  const { added, removed } = entries;
  const { baseline, current } = properties;

  return (
    Object.keys(added).length > 0 ||
    Object.keys(removed).length > 0 ||
    baseline.name !== current.name ||
    baseline.collections.length !== current.collections.length ||
    !baseline.collections.every((id) => current.collections.includes(id))
  );
};

/**
 * Validates the data in a custom list editor state, and checks if the data has been modified.
 *
 * @param state The custom list editor state
 * @returns     A new custom list editor state, with the isValid and isModified properties updated
 *              to reflect the data in the input state. All other properties of the returned state
 *              are identical to the input state.
 */
const validateAndCheckModified = (
  state: CustomListEditorState
): CustomListEditorState => {
  return produce(state, (draftState) => {
    draftState.isValid = isValid(draftState);
    draftState.isModified = isModified(draftState);
  });
};

/**
 * A decorator for an action handler that:
 *
 * - Applies the given handler to obtain a new state.
 * - Validates the data in the new state, and checks if the data in the new state has been modified
 *   since the last save.
 * - Returns a new state, with the isValid and isModified properties updated to be correct for
 *   the state returned by the given handler.
 *
 * This decorator should be applied to any handler that could plausibly affect whether or not the
 * custom list editor data is valid or modified.
 *
 * @param handler The action handler to decorate. This can be any function that accepts a custom
 *                list editor state and an action, and returns a new custom list editor state.
 * @returns       The decorated action handler.
 */
const validatedHandler = (handler) => (state: CustomListEditorState, action?) =>
  validateAndCheckModified(handler(state, action));

/**
 * Generates the initial state for a previously saved list.
 *
 * @param id   The id of the list.
 * @param data The data received from a call to the custom_lists endpoint in the CM. This contains
 *             basic information about all the lists in the library. If a list with the given id
 *             exists in the data, the initial state is populated with the data for that list.
 * @returns    The initial state for the list.
 */
const initialStateForList = (id: number, data): CustomListEditorState => {
  let customList = null;
  let error = null;

  if (data && id !== null) {
    customList = data.custom_lists.find((list) => list.id === id);

    if (!customList) {
      error = `Custom list not found for ID: ${id}`;
    }
  }

  return produce(initialState, (draftState) => {
    draftState.id = id;

    if (customList) {
      const initialProperties = {
        name: customList.name,
        collections: customList.collections.map((collection) => collection.id),
      };

      draftState.properties.baseline = initialProperties;
      draftState.properties.current = initialProperties;

      draftState.entries.baselineTotalCount = customList.entry_count;
    }

    draftState.error = error;
  });
};

/**
 * For a given custom list editor entries data, applies the added and removed deltas to the
 * baseline entries. This mutates the input object: current is set to the result of applying the
 * deltas to the baseline; currentTotalCount is set to the total count after applying the delta,
 * calculated from baselineTotalCount.
 *
 * NB: Since this function mutates the input, it must only be used on a draft object, inside an
 * immer produce recipe.
 *
 * @param entries The entries data to update.
 */
const applyEntriesDelta = (entries: CustomListEditorEntriesData) => {
  const { baseline, baselineTotalCount, added, removed } = entries;

  const addedEntries = Object.values(added);

  // Show the most recently added entries at the top.
  addedEntries.reverse();

  entries.current = addedEntries.concat(
    baseline.filter((entry) => !removed[entry.id])
  );

  const addedCount = addedEntries.length;
  const removedCount = Object.keys(removed).length;
  const currentCount = entries.current.length;

  entries.currentTotalCount = Math.max(
    baselineTotalCount + addedCount - removedCount,
    currentCount
  );
};

/**
 * Handle the OPEN_CUSTOM_LIST_EDITOR action. This action is fired when a new custom list editor is
 * opened, e.g. by clicking the Edit button on a list, or the Create button in the lists sidebar.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - id: The id of the list
 *               - data: The data received from a call to the custom_lists endpoint in the CM.
 *                       If present, this contains basic information about all the lists in the
 *                       library. The id supplied in the action is expected to correspond to the id
 *                       of a list that is present in the data. It is possible for this to be null,
 *                       since the call to custom_lists may still be in flight when the editor is
 *                       opened. If this occurs, the handler for the CUSTOM_LISTS_LOAD action will
 *                       take care of updating the state when the data becomes available.
 * @returns      The next state
 */
const handleCustomListEditorOpen = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { id, data } = action;

  return initialStateForList(id ? parseInt(id, 10) : null, data);
};

/**
 * Handle the CUSTOM_LISTS_LOAD action. This action is fired when a call to the custom_lists
 * endpoint in the CM completes.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - data: The data received from a call to the custom_lists endpoint in the CM.
 *                       This contains basic information about all the lists in the library. The id
 *                       stored in the current state, if it is not null, is expected to correspond
 *                       to the id of a list that is present in the data.
 * @returns      The next state
 */
const handleCustomListsLoad = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { id } = state;
  const { data } = action;

  return initialStateForList(id, data);
};

/**
 * Handle the CUSTOM_LIST_DETAILS_LOAD action. This action is fired when a call to the
 * custom_list/{id} endpoint in the CM completes.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - data: The data received from a call to the custom_list/{id} endpoint in the CM.
 *                       This contains a list of entries.
 * @returns      The next state
 */
const handleCustomListDetailsLoad = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;

      entries.baseline = action.data.books;

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the CUSTOM_LIST_DETAILS_MORE_LOAD action. This action is fired when a call to the
 * custom_list/{id}?after={count} endpoint in the CM completes.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - data: The data received from a call to the custom_list/{id} endpoint in the CM.
 *                       This contains a list of entries.
 * @returns      The next state
 */
const handleCustomListDetailsMoreLoad = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;

      entries.baseline = entries.baseline.concat(action.data.books);

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the UPDATE_CUSTOM_LIST_EDITOR_PROPERTY action. This action is fired when the user changes
 * the value of a list property (e.g. name, collections) on the form.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - name:  The name of the property that was updated.
 *               - value: The value of the property.
 * @returns      The next state
 */
const handleUpdateCustomListEditorProperty = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { name, value } = action;

    return produce(state, (draftState) => {
      draftState.properties.current[name] = value;
    });
  }
);

/**
 * Handle the TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION action. This action is fired when the user
 * clicks on a collection checkbox in the form.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - id:  The id of the collection to toggle.
 * @returns      The next state
 */
const handleToggleCustomListEditorCollection = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id } = action;

    return produce(state, (draftState) => {
      const { collections } = draftState.properties.current;
      const index = collections.indexOf(id);

      if (index < 0) {
        collections.push(id);
      } else {
        collections.splice(index, 1);
      }
    });
  }
);

/**
 * Handle the UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM action. This action is fired when the user
 * changes the value of a search parameter in the form.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - name:  The name of the search parameter that was updated.
 *               - value: The value of the search parameter.
 * @returns      The next state
 */
const handleUpdateCustomListEditorSearchParam = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { name, value } = action;

  return produce(state, (draftState) => {
    draftState.searchParams[name] = value;
  });
};

const bookToEntry = (book) => ({
  id: book.id,
  title: book.title,
  authors: book.authors,
  url: book.url,
  medium: getMedium(book),
  language: book.language || "",
});

/**
 * Handle the ADD_CUSTOM_LIST_EDITOR_ENTRY action. This action is fired when the user adds a single
 * book from the search results to the entry list.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - id:   The id of the book in the search results to add to the entries.
 *               - data: The data received from a call to the search endpoint in the CM, which
 *                       contains search results. The The id supplied in the action is expected to
 *                       correspond to the id of a book that is present in the data.
 * @returns      The next state
 */
const handleAddCustomListEditorEntry = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id, data } = action;

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, added, removed } = entries;

      const inList = baseline.find((book) => book.id === id);

      if (!inList) {
        const bookToAdd = data.books.find((book) => book.id === id);
        const isAdded = !!added[id];

        if (bookToAdd && !isAdded) {
          added[id] = bookToEntry(bookToAdd);
        }
      }

      delete removed[id];

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES action. This action is fired when the user adds
 * all books from the search results to the entry list.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - data: The data received from a call to the search endpoint in the CM, which
 *                       contains search results.
 * @returns      The next state
 */
const handleAddAllCustomListEditorEntries = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { books } = action.data;

    // Add the books in reverse order, so that they appear in the entry list in the same order as
    // they appear in the search results.

    books.reverse();

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, added, removed } = entries;

      const listIds = baseline.reduce((ids, book) => {
        ids[book.id] = true;

        return ids;
      }, {});

      books
        .filter((book) => !listIds[book.id] && !added[book.id])
        .map((book) => bookToEntry(book))
        .forEach((entry) => (added[entry.id] = entry));

      books.forEach((book) => delete removed[book.id]);

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the DELETE_CUSTOM_LIST_EDITOR_ENTRY action. This action is fired when the user removes a
 * single book from the entry list.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - id: The id of the entry to remove.
 * @returns      The next state
 */
const handleDeleteCustomListEditorEntry = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { id } = action;

    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { added, removed } = entries;

      if (added[id]) {
        delete added[id];
      } else {
        removed[id] = true;
      }

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES action. This action is fired when the user
 * removes all books from the entry list.
 *
 * @param state  The current state
 * @returns      The next state
 */
const handleDeleteAllCustomListEditorEntries = validatedHandler(
  (state: CustomListEditorState): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { entries } = draftState;
      const { baseline, removed } = entries;

      baseline.forEach((book) => {
        removed[book.id] = true;
      });

      entries.added = {};

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the RESET_CUSTOM_LIST_EDITOR action. This action is fired when the user cancels unsaved
 * changes in the editor form.
 *
 * @param state  The current state
 * @returns      The next state
 */
const handleResetCustomListEditor = validatedHandler(
  (state: CustomListEditorState): CustomListEditorState => {
    return produce(state, (draftState) => {
      const { properties, entries } = draftState;

      properties.current = properties.baseline;

      entries.added = {};
      entries.removed = {};

      applyEntriesDelta(entries);
    });
  }
);

export default (
  state: CustomListEditorState = initialState,
  action
): CustomListEditorState => {
  switch (action.type) {
    case ActionCreator.OPEN_CUSTOM_LIST_EDITOR:
      return handleCustomListEditorOpen(state, action);
    case `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`:
      return handleCustomListsLoad(state, action);
    case `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.LOAD}`:
      return handleCustomListDetailsLoad(state, action);
    case `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`:
      return handleCustomListDetailsMoreLoad(state, action);
    case ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY:
      return handleUpdateCustomListEditorProperty(state, action);
    case ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION:
      return handleToggleCustomListEditorCollection(state, action);
    case ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM:
      return handleUpdateCustomListEditorSearchParam(state, action);
    case ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY:
      return handleAddCustomListEditorEntry(state, action);
    case ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES:
      return handleAddAllCustomListEditorEntries(state, action);
    case ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY:
      return handleDeleteCustomListEditorEntry(state, action);
    case ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES:
      return handleDeleteAllCustomListEditorEntries(state, action);
    case ActionCreator.RESET_CUSTOM_LIST_EDITOR:
      return handleResetCustomListEditor(state, action);
    default:
      return state;
  }
};

/**
 * Converts a custom list editor state to multipart form data, suitable for posting to the
 * custom_list/{id} endpoint of the CM.
 *
 * @param state The custom list editor state
 * @returns     A FormData object that represents the data in the custom list editor
 */
export const getCustomListEditorFormData = (
  state: CustomListEditorState
): FormData => {
  const data = new (window as any).FormData();

  const { id, properties, entries } = state;

  if (id) {
    data.append("id", id);
  }

  const { name, collections } = properties.current;

  data.append("name", name);
  data.append("collections", JSON.stringify(collections));

  const { baseline, current, removed } = entries;

  data.append("entries", JSON.stringify(current));

  const entriesById = baseline.reduce((ids, entry) => {
    ids[entry.id] = entry;

    return ids;
  }, {});

  const deletedEntries = Object.keys(removed).map((id) => entriesById[id]);

  data.append("deletedEntries", JSON.stringify(deletedEntries));

  return data;
};

/**
 * Converts search parameters in a custom list editor state to a search query URL.
 *
 * @param state   The custom list editor state
 * @param library The short name of the library that contains the list being edited
 * @returns
 */
export const getCustomListEditorSearchUrl = (
  state: CustomListEditorState,
  library: string
): string => {
  const { entryPoint, terms, sort, language } = state.searchParams;

  const queryParams = [`q=${encodeURIComponent(terms)}`];

  if (entryPoint !== "All") {
    queryParams.push(`entrypoint=${encodeURIComponent(entryPoint)}`);
  }

  if (sort) {
    queryParams.push(`order=${encodeURIComponent(sort)}`);
  }

  if (language) {
    queryParams.push(`language=${encodeURIComponent(language)}`);
  }

  return `/${library}/search?${queryParams.join("&")}`;
};
