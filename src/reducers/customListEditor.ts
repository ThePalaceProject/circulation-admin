import produce from "immer";
import { BookData } from "opds-web-client/lib/interfaces";
import { getMedium } from "opds-web-client/lib/utils/book";
import ActionCreator from "../actions";
import { AdvancedSearchQuery } from "../interfaces";

const DEFAULT_QUERY_OPERATOR = "eq";

export interface Entry extends BookData {
  medium?: string;
}

/**
 * A counter for generating unique IDs for advanced search queries.
 */
let queryIdCounter = 0;

/**
 * Generate a new, unique advanced search query ID.
 *
 * @returns The query ID
 */
const newQueryId = (): string => {
  const id = queryIdCounter.toString();

  queryIdCounter += 1;

  return id;
};

/**
 * Build a full advanced search query from the include query and exclude query in some search
 * parameters.
 *
 * @param searchParams The search parameters to use to build the query
 * @returns            The full query that incorporates both the include and exclude queries from
 *                     the search parameters
 */
export const buildAdvSearchQuery = (
  searchParams: CustomListEditorSearchParams
): AdvancedSearchQuery => {
  const { include, exclude } = searchParams.advanced;

  const includeQuery = include.query;
  const excludeQuery = exclude.query;

  if (excludeQuery) {
    const notQuery = {
      not: [
        {
          ...excludeQuery,
        },
      ],
    };

    if (!includeQuery) {
      return notQuery;
    }

    return {
      and: [
        {
          ...includeQuery,
        },
        notQuery,
      ],
    };
  }

  if (includeQuery) {
    return includeQuery;
  }

  return null;
};

/**
 * Build a serialized JSON string representing the search facets (media type, sort order) in some
 * given search parameters, suitable for sending to the CM when saving an auto updating list.
 *
 * @param searchParams The search parameters
 * @returns            The JSON string representing the search facets
 */

export const buildSearchFacetString = (
  searchParams: CustomListEditorSearchParams
): string => {
  const { entryPoint, sort } = searchParams;
  const facets: Record<string, string> = {};

  if (entryPoint !== "All") {
    facets.media = entryPoint;
  }

  if (sort) {
    facets.order = sort;
  }

  return JSON.stringify(facets);
};

/**
 * Build a serialized JSON string representing the advanced search query in some given search
 * parameters, suitable for sending to the CM to execute the search.
 *
 * @param searchParams The search parameters
 * @param indentSpaces The number of spaces to use to indent the JSON. If > 0, the JSON is
 *                     pretty-printed on multiple lines. If 0, a single line of JSON is returned.
 * @param encode       If true, URL-encode the JSON.
 * @returns            The JSON string representing the advanced search query
 */
export const buildAdvSearchQueryString = (
  searchParams: CustomListEditorSearchParams,
  indentSpaces: number = 0,
  encode: boolean = true
): string => {
  const query = buildAdvSearchQuery(searchParams);

  if (!query) {
    return "";
  }

  const queryString = JSON.stringify(
    { query },
    (key, value) => {
      // The id is used by the UI only. The CM doesn't know/care about it, so it can (must?) be
      // omitted.

      if (key === "id") {
        return undefined;
      }

      // If the operator is the default operator, omit it for brevity.

      if (key === "op" && value === DEFAULT_QUERY_OPERATOR) {
        return undefined;
      }

      return value;
    },
    indentSpaces
  );

  return encode ? encodeURIComponent(queryString) : queryString;
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

  const { id, properties, entries, searchParams } = state;

  if (id) {
    data.append("id", id);
  }

  const { name, collections, autoUpdate } = properties.current;

  data.append("name", name);
  data.append("collections", JSON.stringify(collections));

  if (autoUpdate) {
    data.append("auto_update", "true");

    data.append(
      "auto_update_query",
      buildAdvSearchQueryString(searchParams.current, 0, false)
    );

    data.append(
      "auto_update_facets",
      buildSearchFacetString(searchParams.current)
    );
  } else {
    const { baseline, current, removed } = entries;

    data.append("entries", JSON.stringify(current));

    const entriesById = baseline.reduce((ids, entry) => {
      ids[entry.id] = entry;

      return ids;
    }, {});

    const deletedEntries = Object.keys(removed).map((id) => entriesById[id]);

    data.append("deletedEntries", JSON.stringify(deletedEntries));
  }

  return data;
};

/**
 * Build a URL from some search parameters that can be used to execute the search against the CM.
 *
 * @param searchParams The search parameters
 * @param library      The short name of the library
 * @returns            A URL to the search endpoint of the CM, containing all of the query
 *                     parameters needed to execute the search
 */
export const buildSearchUrl = (
  searchParams: CustomListEditorSearchParams,
  library: string
): string => {
  const { entryPoint, terms, sort } = searchParams;

  const queryParams = [];

  if (entryPoint !== "All") {
    queryParams.push(`media=${encodeURIComponent(entryPoint)}`);
  }

  if (sort) {
    queryParams.push(`order=${encodeURIComponent(sort)}`);
  }

  const advSearchQuery = buildAdvSearchQueryString(searchParams);

  if (advSearchQuery) {
    queryParams.push("search_type=json");
    queryParams.push(`q=${advSearchQuery}`);
  } else {
    queryParams.push(`q=${encodeURIComponent(terms)}`);
  }

  return `/${library}/search?${queryParams.join("&")}`;
};

/**
 * Convert search parameters in a custom list editor state to a search query URL.
 *
 * @param state   The custom list editor state
 * @param library The short name of the library that contains the list being edited
 * @returns       The URL, or null if the custom list editor state does not contain either query
 *                terms or an advanced search query.
 */
export const getCustomListEditorSearchUrl = (
  state: CustomListEditorState,
  library: string
): string => {
  const { searchParams } = state;
  const { current: currentSearchParams } = searchParams;
  const { terms, advanced } = currentSearchParams;

  if (terms || advanced.include.query || advanced.exclude.query) {
    return buildSearchUrl(currentSearchParams, library);
  }

  return null;
};

/**
 * Recursively assign ids to an advanced search query and all of its descendent queries. This is
 * useful when a saved advanced search query is retrieved from the CM. The CM doesn't know/care
 * about query ids, but them.
 *
 * This function mutates the input query.
 *
 * @param query The advanced search query
 */
const populateQueryIds = (query: AdvancedSearchQuery): void => {
  if (!query.id) {
    query.id = newQueryId();
  }

  const childQueries = query.and || query.or || query.not;

  if (childQueries) {
    childQueries.forEach((childQuery) => populateQueryIds(childQuery));
  }
};

/**
 * Recursively populate any missing operators in an advanced search query and all of its descendant
 * queries with the default operator. This is useful when a saved advanced search query is
 * retrieved from the CM. The default operator may be omitted in the retrieved query, but the UI
 * expects it to be explicitly specified.
 *
 * This function mutates the input query.
 *
 * @param query
 */
const populateDefaultQueryOperators = (query: AdvancedSearchQuery): void => {
  const childQueries = query.and || query.or || query.not;

  if (childQueries) {
    childQueries.forEach((childQuery) =>
      populateDefaultQueryOperators(childQuery)
    );
  } else {
    if (!query.op) {
      query.op = DEFAULT_QUERY_OPERATOR;
    }
  }
};

/**
 * Parse a JSON-serialized advanced search query into an include query and an exlude query. The
 * structure of the query must be one of the following:
 *
 * - Include only: A single non-NOT query
 * - Exclude only: A single NOT query
 * - Both exclude and include: A single NOT query AND'ed with a single non-NOT query
 *
 * The behavior of this function is unspecified if the JSON has any other structure.
 *
 * @param json The serialized query
 * @returns    A tuple of an include query and an exclude query, parsed from the json. Either or
 *             both may be null.
 */
export const parseAdvancedSearchQuery = (
  json: string
): [AdvancedSearchQuery, AdvancedSearchQuery] => {
  if (!json) {
    return [null, null];
  }

  const query = JSON.parse(json)?.query;

  if (!query) {
    return [null, null];
  }

  populateQueryIds(query);
  populateDefaultQueryOperators(query);

  const andedQueries = query.and;

  if (andedQueries && andedQueries.length === 2) {
    const affirmativeQuery = andedQueries.find((query) => !query.not);
    const negativeQuery = andedQueries.find((query) =>
      Array.isArray(query.not)
    );

    if (affirmativeQuery && negativeQuery) {
      return [affirmativeQuery, negativeQuery.not[0]];
    }
  }

  const negativeQueries = query.not;

  if (negativeQueries) {
    return [null, negativeQueries[0]];
  }

  return [query, null];
};

/**
 * Parse JSON-serialized search facets.
 *
 * @param json The serialized search facets
 * @returns    An object containg facet names and values, which may be empty.
 */
const parseSearchFacets = (json: string): Record<string, string> => {
  if (!json) {
    return {};
  }

  return JSON.parse(json) || {};
};

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

  /**
   * The list should be automatically populated from the search parameters.
   */
  autoUpdate: boolean;
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
 * Data that describes an advanced search builder.
 */
export interface CustomListEditorAdvancedSearchBuilderData {
  /**
   * The ID of the currently selected advanced search query. This could be the root query, or any
   * query nested under the root query.
   */
  selectedQueryId: string;

  /**
   * The root advanced search query.
   */
  query: AdvancedSearchQuery;
}

/**
 * Data desribing the advanced search builders on the custom list editor.
 */
export interface CustomListEditorAdvancedSearchBuilders {
  /**
   * Describes the advanced search builder that builds the query to find books to include in the
   * list.
   */
  include: CustomListEditorAdvancedSearchBuilderData;

  /**
   * Describes the advanced search builder that builds the query to find books to exclude from the
   * list.
   */
  exclude: CustomListEditorAdvancedSearchBuilderData;
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

  /**
   * Advanced search builder information.
   */
  advanced: CustomListEditorAdvancedSearchBuilders;
}

/**
 * Search parameters, tracked since the last save.
 */
export interface CustomListEditorTrackedSearchParams {
  /**
   * The search parameters, when the list was last saved. This can be used to restore the editor to
   * the last save point, and to detect changes since the last save.
   */
  baseline: CustomListEditorSearchParams;

  /**
   * The current properties of the list, since the last save.
   */
  current: CustomListEditorSearchParams;
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
   * The update status of the list, if it is auto updating.
   */
  autoUpdateStatus: string;

  /**
   * Flag indicating if the auto updating lists feature is enabled.
   */
  isAutoUpdateEnabled: boolean;

  /**
   * The loading state of the list; true if the list data has been loaded (not including the list
   * entries), false otherwise.
   */
  isLoaded: boolean;

  /**
   * A flag indicating that the current library owns this list; true if the current library is the
   * owner, false if the list is shared with this library, but owned by another.
   */
  isOwner: boolean;

  /**
   * A flag indicating that the list is shared to multiple libraries.
   */
  isShared: boolean;

  /**
   * A flag indicating that a share operation on the list is in progress.
   */
  isSharePending: boolean;

  /**
   * The properties of the list.
   */
  properties: CustomListEditorTrackedProperties;

  /**
   * The parameters to use when searching on the custom list editor.
   */
  searchParams: CustomListEditorTrackedSearchParams;

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
   * The modified state of the search parameters; true if the search has been changed since the
   * last save, false otherwise.
   */
  isSearchModified: boolean;

  /**
   * An error message, if an error has occurred.
   */
  error: string;
}

const initialProperties = {
  name: "",
  collections: [],
  autoUpdate: false,
};

const initialSearchParams = {
  entryPoint: "All",
  terms: "",
  sort: null,
  language: "all",
  advanced: {
    include: {
      query: null,
      selectedQueryId: null,
    },
    exclude: {
      query: null,
      selectedQueryId: null,
    },
  },
};

/**
 * The initial state. Provides defaults for a new list.
 */
export const initialState: CustomListEditorState = {
  id: null,
  autoUpdateStatus: "",
  isAutoUpdateEnabled: false,
  isLoaded: false,
  isOwner: true,
  isShared: false,
  isSharePending: false,
  properties: {
    baseline: initialProperties,
    current: initialProperties,
  },
  searchParams: {
    baseline: initialSearchParams,
    current: initialSearchParams,
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
  isSearchModified: false,
  error: null,
};

/**
 * Determines if a custom list editor contains valid current data, given its state. A list is valid
 * if it has a name, and has either:
 * - At least one source collection, or
 * - If the list is auto updating, either an include query or an exclude query; otherwise, at least
 *   one entry.
 *
 * @param state The custom list editor state
 * @returns     true if the editor contains valid data, false otherwise
 */
const isValid = (state: CustomListEditorState): boolean => {
  const { properties, entries, searchParams } = state;
  const { name, collections, autoUpdate } = properties.current;
  const { currentTotalCount } = entries;
  const { include, exclude } = searchParams.current.advanced;

  return (
    !!name &&
    (collections.length > 0 ||
      (autoUpdate && (!!include.query || !!exclude.query)) ||
      (!autoUpdate && currentTotalCount > 0))
  );
};

/**
 * Determines if a custom list editor has search parameters that have been modified since it was
 * last saved, given its state.
 *
 * @param state The custom list editor state
 * @returns     true if the search parameters have been modified since last save, false otherwise
 */
const isSearchModified = (state: CustomListEditorState): boolean => {
  const { baseline, current } = state.searchParams;

  // Doing the comparison this way is sub-optimal, but should be fine as long as the advanced
  // search queries don't get super complicated, and we don't call this function too frequently.

  const baselineSearchUrl = buildSearchUrl(baseline, "");
  const currentSearchUrl = buildSearchUrl(current, "");

  return baselineSearchUrl !== currentSearchUrl;
};

/**
 * Checks if a the search parameters in a custom list editor state have been modified, and stores
 * the result in the state.
 *
 * @param state The custom list editor state
 * @returns     A new custom list editor state, with the isSearchModified property updated with the
 *              result. All other properties of the returned state are identical to the input state.
 */
const checkSearchModified = (
  state: CustomListEditorState
): CustomListEditorState => {
  return produce(state, (draftState) => {
    draftState.isSearchModified = isSearchModified(draftState);
  });
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
    baseline.autoUpdate !== current.autoUpdate ||
    (current.autoUpdate && state.isSearchModified) ||
    baseline.collections.length !== current.collections.length ||
    !baseline.collections.every((id) => current.collections.includes(id))
  );
};

/**
 * Validates the data in a custom list editor state, and checks if the data has been modified, and
 * stores the results in the state.
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
 * @param id    The id of the list.
 * @param data  The data received from a call to the custom_lists endpoint in the CM. This contains
 *              basic information about all the lists in the library. If a list with the given id
 *              exists in the data, the initial state is populated with the data for that list.
 * @param state The current state.
 * @returns     The next state, representing the initial state for the list.
 */
const initialStateForList = (
  id: number,
  data,
  state: CustomListEditorState
): CustomListEditorState => {
  let customList = null;
  let error = null;

  if (data && id !== null) {
    customList = data.custom_lists.find((list) => list.id === id);

    if (!customList) {
      error = `Custom list not found for ID: ${id}`;
    }
  }

  return produce(state, (draftState) => {
    const { isAutoUpdateEnabled } = draftState;

    draftState.id = id;

    // If auto update is enabled, default the autoUpdate property of a list to true.

    if (isAutoUpdateEnabled) {
      draftState.properties.baseline.autoUpdate = true;
      draftState.properties.current.autoUpdate = true;
    }

    if (customList) {
      draftState.isLoaded = true;
      draftState.isOwner = customList.is_owner;
      draftState.isShared = customList.is_shared;

      draftState.autoUpdateStatus =
        isAutoUpdateEnabled && !!customList.auto_update
          ? customList.auto_update_status
          : "";

      const initialProperties = {
        name: customList.name || "",
        collections: customList.collections.map((collection) => collection.id),

        // If auto update is disabled, set the autoUpdate property of the list to false, regardless
        // of the value that was retrieved from the server. Otherwise, use the value from the
        // server.
        autoUpdate: isAutoUpdateEnabled && !!customList.auto_update,
      };

      draftState.properties.baseline = initialProperties;
      draftState.properties.current = initialProperties;

      draftState.entries.baselineTotalCount = customList.entry_count;

      const [includeQuery, excludeQuery] = parseAdvancedSearchQuery(
        customList.auto_update_query
      );

      draftState.searchParams.baseline.advanced.include.query = includeQuery;
      draftState.searchParams.baseline.advanced.exclude.query = excludeQuery;
      draftState.searchParams.current.advanced.include.query = includeQuery;
      draftState.searchParams.current.advanced.exclude.query = excludeQuery;

      const { media, order } = parseSearchFacets(customList.auto_update_facets);

      if (media) {
        draftState.searchParams.baseline.entryPoint = media;
        draftState.searchParams.current.entryPoint = media;
      }

      if (order) {
        draftState.searchParams.baseline.sort = order;
        draftState.searchParams.current.sort = order;
      }
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

  const openState = produce(initialState, (draftState) => {
    draftState.isAutoUpdateEnabled = state.isAutoUpdateEnabled;
  });

  return initialStateForList(id ? parseInt(id, 10) : null, data, openState);
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
  if (action.isAfterShare) {
    // If this is a reload of custom list data following a share operation, we can ignore the
    // action. The sharing state will be updated by the handler for the CUSTOM_LIST_SHARE_SUCCESS
    // action.

    return state;
  }

  const { id } = state;
  const { data } = action;

  return initialStateForList(id, data, state);
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
const handleUpdateCustomListEditorSearchParam = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    const { name, value } = action;

    return checkSearchModified(
      produce(state, (draftState) => {
        draftState.searchParams.current[name] = value;
      })
    );
  }
);

/**
 * Add an advanced search query to a given query tree.
 *
 * @param query         The root of the query tree.
 * @param targetId      The ID of the node in the query tree where the new query should be added.
 *                      This is expected to be the ID of the root query, or some descendant of the
 *                      root query. If the target is an boolean (and/or) query, the new query is
 *                      added as a child of the target. If the target is a leaf query, a new
 *                      boolean query is created at the location of the target, the target is made
 *                      a child of the new boolean, and the new query is added as another child of
 *                      the new boolean. If the new boolean query is the child of a boolean query,
 *                      its operator is set to the opposite of the parent. Otherwise (if it is the
 *                      root query), its operator is set to the preferredBool argument.
 * @param newQuery      The query to add to the tree
 * @param preferredBool The boolean operator ("and" or "or") to use when creating a boolean query
 *                      at the root of the tree.
 * @returns             A query tree that is the result of adding the new query to the given
 *                      query at the target. If no query with the target ID is found in the given
 *                      query, it is returned unchanged.
 */
const addDescendantQuery = (
  query: AdvancedSearchQuery,
  targetId: string,
  newQuery: AdvancedSearchQuery,
  preferredBool: string
): AdvancedSearchQuery => {
  if (query.and || query.or) {
    const bool = query.and ? "and" : "or";
    const children = query[bool];

    if (query.id === targetId) {
      return {
        id: query.id,
        [bool]: [...children, newQuery],
      };
    }

    const oppositeBool = bool === "and" ? "or" : "and";

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      const updatedChild = addDescendantQuery(
        child,
        targetId,
        newQuery,
        oppositeBool
      );

      if (updatedChild !== child) {
        const newChildren = [...children];

        newChildren[i] = updatedChild;

        return {
          id: query.id,
          [bool]: newChildren,
        };
      }
    }

    return query;
  }

  if (query.id === targetId) {
    return {
      id: query.id,
      [preferredBool]: [
        {
          ...query,
          id: newQueryId(),
        },
        newQuery,
      ],
    };
  }

  return query;
};

/**
 * Remove an advanced search query from a given query tree.
 *
 * @param query    The root of the query tree.
 * @param targetId The ID of the query to remove. This is expected to be the ID of the root query,
 *                 or some descendant of the root query.
 * @returns        A query tree that is the result of removing the specified query from the given
 *                 query. If the target ID identifies the root query, null is returned. If no query
 *                 with the target ID is found in the given query, it is returned unchanged.
 */
const removeDescendantQuery = (
  query: AdvancedSearchQuery,
  targetId: string
): AdvancedSearchQuery => {
  if (query.id === targetId) {
    return null;
  }

  if (query.and || query.or) {
    const bool = query.and ? "and" : "or";
    const children = query[bool];
    const updatedChildren = children.filter((child) => child.id !== targetId);

    if (updatedChildren.length !== children.length) {
      if (updatedChildren.length === 1) {
        return { ...updatedChildren[0] };
      }

      return {
        id: query.id,
        [bool]: updatedChildren,
      };
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const updatedChild = removeDescendantQuery(child, targetId);

      if (updatedChild !== child) {
        const newChildren = [...children];

        newChildren[i] = updatedChild;

        return {
          id: query.id,
          [bool]: newChildren,
        };
      }
    }
  }

  return query;
};

/**
 * Find the path to an advanced search query in a given query tree.
 *
 * @param query    The root of the query tree.
 * @param targetId The ID of the query to find. This is expected to be the ID of the root query,
 *                 or some descendant of the root query.
 * @returns        An array of query IDs, starting with the root query, and ending with the target
 *                 ID. If no query with the target ID is found in the given query, null is
 *                 returned.
 */
const findDescendantQueryPath = (
  query: AdvancedSearchQuery,
  targetId: string
): string[] => {
  if (query.id === targetId) {
    return [query.id];
  }

  if (query.and || query.or) {
    const bool = query.and ? "and" : "or";
    const children = query[bool];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const path = findDescendantQueryPath(child, targetId);

      if (path) {
        return [query.id, ...path];
      }
    }
  }

  return null;
};

/**
 * Find an advanced search query in a given query tree.
 *
 * @param query    The root of the query tree.
 * @param targetId The ID of the query to find. This is expected to be the ID of the root query,
 *                 or some descendant of the root query.
 * @returns        The query with the target ID, if it exists in the query tree. Otherwise, null is
 *                 returned.
 */
const findDescendantQuery = (
  query: AdvancedSearchQuery,
  targetId: string
): AdvancedSearchQuery => {
  if (query.id === targetId) {
    return query;
  }

  if (query.and || query.or) {
    const bool = query.and ? "and" : "or";
    const children = query[bool];
    const targetQuery = children.find((child) => child.id === targetId);

    if (targetQuery) {
      return targetQuery;
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const targetQuery = findDescendantQuery(child, targetId);

      if (targetQuery) {
        return targetQuery;
      }
    }
  }

  return null;
};

/**
 * Get the default boolean operator for a given advanced search query builder.
 *
 * @param builderName The name of the query builder.
 * @returns           The default boolean operator, which is "and" for the "include" query builder,
 *                    and "or" for the "exclude" query builder.
 */
const getDefaultBooleanOperator = (builderName: string) => {
  return builderName === "include" ? "and" : "or";
};

/**
 * Handle the ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY action. This action is fired when the user
 * adds a new filter to an advanced search query builder.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - builderName: The name of the query builder.
 *               - query:       The new query.
 * @returns      The next state
 */
const handleAddCustomListEditorAdvSearchQuery = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return checkSearchModified(
      produce(state, (draftState) => {
        const { builderName, query } = action;
        const builder = draftState.searchParams.current.advanced[builderName];
        const { query: currentQuery, selectedQueryId } = builder;

        const newQuery = {
          ...query,
          id: newQueryId(),
        };

        if (!currentQuery) {
          builder.query = newQuery;
          builder.selectedQueryId = newQuery.id;
        } else {
          builder.query = addDescendantQuery(
            currentQuery,
            selectedQueryId || currentQuery.id,
            newQuery,
            getDefaultBooleanOperator(builderName)
          );
        }
      })
    );
  }
);

/**
 * Handle the UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN action. This action is fired when
 * the user changes the boolean operator (and/or) on a filter in an advanced search query builder.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - builderName: The name of the query builder.
 *               - id:          The ID of the query to update.
 *               - bool:        The new boolean operator for the query ("and" or "or").
 * @returns      The next state
 */
const handleUpdateCustomListEditorAdvSearchQueryBoolean = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return checkSearchModified(
      produce(state, (draftState) => {
        const { builderName, id, bool } = action;
        const builder = draftState.searchParams.current.advanced[builderName];
        const { query: currentQuery } = builder;
        const targetQuery = findDescendantQuery(currentQuery, id);

        if (
          targetQuery &&
          (targetQuery.and || targetQuery.or) &&
          !targetQuery[bool]
        ) {
          const oppositeBool = bool === "and" ? "or" : "and";
          const children = targetQuery[oppositeBool];

          delete targetQuery[oppositeBool];

          targetQuery[bool] = children;
        }
      })
    );
  }
);

/**
 * Handle the MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY action. This action is fired when the user
 * moves a filter to another filter in an advanced search query builder, typically through a
 * drag-and-drop.
 *
 * Note: If a boolean has two filters, and one is dropped on the other, this results in the boolean
 * operator being swapped. A move operation is really an add followed by a remove, and this is the
 * result of the normal rules for adding and removing queries. When a new boolean group is created
 * by the add operation, it is set to the opposite boolean operator of the parent; and when the
 * remove operation leaves the original parent with only one child, the remaining child (now with
 * the opposite boolean operator of the original parent) is lifted up, and the original parent is
 * deleted.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - builderName: The name of the query builder.
 *               - id:          The ID of the query to move.
 *               - targetId:    The ID of query to which to move the specified query.
 * @returns      The next state
 */
const handleMoveCustomListEditorAdvSearchQuery = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return checkSearchModified(
      produce(state, (draftState) => {
        const { builderName, id, targetId } = action;
        const builder = draftState.searchParams.current.advanced[builderName];
        const { query: currentQuery } = builder;
        const query = findDescendantQuery(currentQuery, id);

        const newQuery = {
          ...query,
          id: newQueryId(),
        };

        const afterAddQuery = addDescendantQuery(
          currentQuery,
          targetId,
          newQuery,
          getDefaultBooleanOperator(builderName)
        );

        const afterRemoveQuery = removeDescendantQuery(afterAddQuery, id);

        builder.query = afterRemoveQuery;
        builder.selectedQueryId = targetId;
      })
    );
  }
);

/**
 * Handle the REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY action. This action is fired when the user
 * removes a filter in an advanced search builder.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - builderName: The name of the query builder.
 *               - id:          The ID of the query to remove.
 * @returns      The next state
 */
const handleRemoveCustomListEditorAdvSearchQuery = validatedHandler(
  (state: CustomListEditorState, action): CustomListEditorState => {
    return checkSearchModified(
      produce(state, (draftState) => {
        const { builderName, id } = action;
        const builder = draftState.searchParams.current.advanced[builderName];
        const { query: currentQuery } = builder;

        const afterRemoveQuery = removeDescendantQuery(currentQuery, id);

        if (afterRemoveQuery !== currentQuery) {
          builder.query = afterRemoveQuery;

          // It is possible that removeDescendantQuery removed more than just the one query; for
          // example, if the removed query was the child of an and/or query, and removing it left only
          // one other child query, then the remaining child would have been lifted out of the parent,
          // and the parent would have been deleted as well. For this reason, we can't assume that the
          // parent of the removed query still exists; we have to find the nearest ancestor of the
          // removed query that remains in the tree, to make that the new selected query.

          const path = findDescendantQueryPath(currentQuery, id);

          path.pop();
          path.reverse();

          const ancestorId = path.find((id) =>
            findDescendantQuery(afterRemoveQuery, id)
          );

          builder.selectedQueryId = ancestorId;
        }
      })
    );
  }
);

/**
 * Handle the SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY action. This action is fired when the user
 * clicks on a filter in an advanced search query builder.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - builderName: The name of the query builder.
 *               - id:          The ID of the query to select.
 * @returns      The next state
 */
const handleSelectCustomListEditorAdvSearchQuery = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  return produce(state, (draftState) => {
    const { builderName, id } = action;
    const builder = draftState.searchParams.current.advanced[builderName];

    builder.selectedQueryId = id;
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
      const { properties, searchParams, entries } = draftState;

      properties.current = properties.baseline;
      searchParams.current = searchParams.baseline;

      entries.added = {};
      entries.removed = {};

      applyEntriesDelta(entries);
    });
  }
);

/**
 * Handle the CUSTOM_LIST_SHARE_REQUEST action. This action is fired when a list share operation
 * is started.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - listId: The id of the list that is being shared.
 * @returns      The next state
 */
const handleCustomListShareRequest = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { listId } = action;
  const { id } = state;

  if (parseInt(listId, 10) === id) {
    return produce(state, (draftState) => {
      draftState.isSharePending = true;
    });
  }

  return state;
};

/**
 * Handle the CUSTOM_LIST_SHARE_SUCCESS action. This action is fired when a list share operation
 * completes successfully.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - data: The data received from a call to the custom_lists endpoint in the CM,
 *                       reflecting the state of the lists after the share was completed.
 *               - listId: The id of the list that was shared.
 * @returns      The next state
 */
const handleCustomListShareSuccess = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { data, listId } = action;
  const { id } = state;

  if (parseInt(listId, 10) === id) {
    const customList = data?.custom_lists.find((list) => list.id === id);

    return produce(state, (draftState) => {
      draftState.isSharePending = false;

      if (customList) {
        draftState.isShared = customList.is_shared;
      }
    });
  }

  return state;
};

/**
 * Handle the CUSTOM_LIST_SHARE_FAILURE action. This action is fired when a list share operation
 * fails.
 *
 * @param state  The current state
 * @param action The action, which should contain the following properties:
 *               - error:  The error that occurred.
 *               - listId: The id of the list that was shared.
 * @returns      The next state
 */
const handleCustomListShareFailure = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { error, listId } = action;
  const { id } = state;

  if (parseInt(listId, 10) === id) {
    return produce(state, (draftState) => {
      draftState.isSharePending = false;
      draftState.error = error.message;
    });
  }

  return state;
};

const handleSetFeatureFlags = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { value = {} } = action;

  if ("enableAutoList" in value) {
    return produce(state, (draftState) => {
      draftState.isAutoUpdateEnabled = !!value.enableAutoList;
    });
  }

  return state;
};

const handleUpdateFeatureFlag = (
  state: CustomListEditorState,
  action
): CustomListEditorState => {
  const { name, value } = action;

  if (name === "enableAutoList") {
    return produce(state, (draftState) => {
      draftState.isAutoUpdateEnabled = !!value;
    });
  }

  return state;
};

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
    case ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY:
      return handleAddCustomListEditorAdvSearchQuery(state, action);
    case ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN:
      return handleUpdateCustomListEditorAdvSearchQueryBoolean(state, action);
    case ActionCreator.MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY:
      return handleMoveCustomListEditorAdvSearchQuery(state, action);
    case ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY:
      return handleRemoveCustomListEditorAdvSearchQuery(state, action);
    case ActionCreator.SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY:
      return handleSelectCustomListEditorAdvSearchQuery(state, action);
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
    case `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`:
      return handleCustomListShareRequest(state, action);
    case `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`:
      return handleCustomListShareSuccess(state, action);
    case `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`:
      return handleCustomListShareFailure(state, action);
    case ActionCreator.SET_FEATURE_FLAGS:
      return handleSetFeatureFlags(state, action);
    case ActionCreator.UPDATE_FEATURE_FLAG:
      return handleUpdateFeatureFlag(state, action);
    default:
      return state;
  }
};
