import {
  AdvancedSearchQuery,
  LibrariesData,
  CustomListsData,
  FeatureFlags,
  QuickSightEmbeddedURLData,
} from "./interfaces";
import { CollectionData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import {
  RequestError,
  RequestRejector,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import BaseActionCreator from "@thepalaceproject/web-opds-client/lib/actions";
import {
  getCustomListEditorFormData,
  getCustomListEditorSearchUrl,
} from "./reducers/customListEditor";

/** Create redux actions to be dispatched by connected components, mostly
    to make requests to the server. */
export default class ActionCreator extends BaseActionCreator {
  static readonly SET_FEATURE_FLAGS = "SET_FEATURE_FLAGS";
  static readonly UPDATE_FEATURE_FLAG = "UPDATE_FEATURE_FLAG";
  static readonly UPDATE_CLEAR_FILTERS_FLAG = "UPDATE_CLEAR_FILTERS_FLAG";
  static readonly EDIT_BOOK = "EDIT_BOOK";
  static readonly BOOK_ADMIN = "BOOK_ADMIN";
  static readonly CUSTOM_LISTS_FOR_BOOK = "CUSTOM_LISTS_FOR_BOOK";
  static readonly EDIT_CUSTOM_LISTS_FOR_BOOK = "EDIT_CUSTOM_LISTS_FOR_BOOK";
  static readonly CUSTOM_LISTS = "CUSTOM_LISTS";
  static readonly CUSTOM_LIST_DETAILS = "CUSTOM_LIST_DETAILS";
  static readonly CUSTOM_LIST_DETAILS_MORE = "CUSTOM_LIST_DETAILS_MORE";
  static readonly EDIT_CUSTOM_LIST = "EDIT_CUSTOM_LIST";
  static readonly DELETE_CUSTOM_LIST = "DELETE_CUSTOM_LIST";
  static readonly CUSTOM_LIST_SHARE = "CUSTOM_LIST_SHARE";
  static readonly EDIT_CUSTOM_LIST_SHARE = "EDIT_CUSTOM_LIST_SHARE";
  static readonly CUSTOM_LISTS_AFTER_SHARE = "CUSTOM_LISTS_AFTER_SHARE";
  static readonly OPEN_CUSTOM_LIST_EDITOR = "OPEN_CUSTOM_LIST_EDITOR";
  static readonly UPDATE_CUSTOM_LIST_EDITOR_PROPERTY =
    "UPDATE_CUSTOM_LIST_EDITOR_PROPERTY";
  static readonly TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION =
    "TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION";
  static readonly UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM =
    "UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM";
  static readonly ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY =
    "ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY";
  static readonly UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN =
    "UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN";
  static readonly MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY =
    "MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY";
  static readonly REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY =
    "REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY";
  static readonly SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY =
    "SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY";
  static readonly ADD_CUSTOM_LIST_EDITOR_ENTRY = "ADD_CUSTOM_LIST_EDITOR_ENTRY";
  static readonly ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES =
    "ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES";
  static readonly DELETE_CUSTOM_LIST_EDITOR_ENTRY =
    "DELETE_CUSTOM_LIST_EDITOR_ENTRY";
  static readonly DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES =
    "DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES";
  static readonly RESET_CUSTOM_LIST_EDITOR = "RESET_CUSTOM_LIST_EDITOR";

  static readonly CIRCULATION_EVENTS_REQUEST = "CIRCULATION_EVENTS_REQUEST";
  static readonly CIRCULATION_EVENTS_SUCCESS = "CIRCULATION_EVENTS_SUCCESS";
  static readonly CIRCULATION_EVENTS_FAILURE = "CIRCULATION_EVENTS_FAILURE";
  static readonly CIRCULATION_EVENTS_LOAD = "CIRCULATION_EVENTS_LOAD";

  static readonly CHANGE_PASSWORD = "CHANGE_PASSWORD";

  static readonly PATRON_LOOKUP = "PATRON_LOOKUP";
  static readonly CLEAR_PATRON_DATA = "CLEAR_PATRON_DATA";
  static readonly RESET_ADOBE_ID = "RESET_ADOBE_ID";

  static readonly QUICKSIGHT_EMBEDDED_URL = "QUICKSIGHT_EMBEDDED_URL";

  csrfToken: string;

  constructor(fetcher?: DataFetcher, csrfToken?: string) {
    fetcher = fetcher || new DataFetcher();
    super(fetcher);
    csrfToken = csrfToken || null;
    this.csrfToken = csrfToken;
  }

  postForm(
    type: string,
    url: string,
    data: FormData | null,
    method?: string,
    defaultErrorMessage?: string,
    returnType?: string
  ) {
    let err: RequestError;
    return ((dispatch) => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.request(type));
        const headers = new Headers();
        if (this.csrfToken) {
          headers.append("X-CSRF-Token", this.csrfToken);
        }
        fetch(url, {
          method: method || "POST",
          headers: headers,
          body: data,
          credentials: "same-origin",
        })
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              dispatch(this.success(type));
              if (response.json && returnType === "JSON") {
                response.json().then((data) => {
                  dispatch(this.load<any>(type, data));
                  resolve(response);
                });
              } else if (response.text) {
                response.text().then((text) => {
                  dispatch(this.load<string>(type, text));
                  resolve(response);
                });
              } else {
                resolve(response);
              }
            } else {
              response
                .json()
                .then((data) => {
                  err = {
                    status: response.status,
                    response: data.detail,
                    url: url,
                  };
                  dispatch(this.failure(type, err));
                  reject(err);
                })
                .catch((_parseError) => {
                  err = {
                    status: response.status,
                    response: defaultErrorMessage || "Failed to save changes",
                    url: url,
                  };
                  dispatch(this.failure(type, err));
                  reject(err);
                });
            }
          })
          .catch((err) => {
            err = {
              status: null,
              response: err.message,
              url: url,
            };
            dispatch(this.failure(type, err));
            reject(err);
          });
      });
    }).bind(this);
  }

  postJSON<T>(type: string, url: string, data: T) {
    let err: RequestError;

    return (dispatch) => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.request(type, url));
        const headers = new Headers();
        if (this.csrfToken) {
          headers.append("X-CSRF-Token", this.csrfToken);
        }
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
          credentials: "same-origin",
        })
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              dispatch(this.success(type));
              resolve(response);
            } else {
              response
                .json()
                .then((data) => {
                  err = {
                    status: response.status,
                    response: data.detail,
                    url: url,
                  };
                  dispatch(this.failure(type, err));
                  reject(err);
                })
                .catch((_parseError) => {
                  err = {
                    status: response.status,
                    response: "Request failed",
                    url: url,
                  };
                  dispatch(this.failure(type, err));
                  reject(err);
                });
            }
          })
          .catch((err) => {
            err = {
              status: null,
              response: err.message,
              url: url,
            };
            dispatch(this.failure(type, err));
            reject(err);
          });
      });
    };
  }

  fetchCustomListsForBook(url: string) {
    return this.fetchJSON<CustomListsData>(
      ActionCreator.CUSTOM_LISTS_FOR_BOOK,
      url
    ).bind(this);
  }

  editCustomListsForBook(url: string, data: FormData) {
    return this.postForm(
      ActionCreator.EDIT_CUSTOM_LISTS_FOR_BOOK,
      url,
      data
    ).bind(this);
  }

  fetchCustomLists(library: string) {
    const url = "/" + library + "/admin/custom_lists";
    return this.fetchJSON<CustomListsData>(
      ActionCreator.CUSTOM_LISTS,
      url
    ).bind(this);
  }

  fetchCustomListDetails(library: string, id: string) {
    const url = "/" + library + "/admin/custom_list/" + id;
    return this.fetchOPDS<CollectionData>(
      ActionCreator.CUSTOM_LIST_DETAILS,
      url
    ).bind(this);
  }

  fetchMoreCustomListEntries() {
    return (dispatch, getState) => {
      const {
        data,
        isFetchingMoreEntries,
      } = getState().editor.customListDetails;

      if (!isFetchingMoreEntries) {
        return dispatch(
          this.fetchOPDS<CollectionData>(
            ActionCreator.CUSTOM_LIST_DETAILS_MORE,
            data.nextPageUrl
          ).bind(this)
        );
      }
    };
  }

  editCustomList(library: string, data: FormData, id?: string) {
    let url = "/" + library + "/admin/custom_lists";
    if (id) {
      url = "/" + library + "/admin/custom_list/" + id;
    }
    return this.postForm(ActionCreator.EDIT_CUSTOM_LIST, url, data).bind(this);
  }

  deleteCustomList(library: string, listId: string) {
    const url = "/" + library + "/admin/custom_list/" + listId;
    return this.postForm(
      ActionCreator.DELETE_CUSTOM_LIST,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  shareCustomList(library: string, listId: string) {
    const shareUrl = "/" + library + "/admin/custom_list/" + listId + "/share";

    const shareAction = this.postForm(
      ActionCreator.EDIT_CUSTOM_LIST_SHARE,
      shareUrl,
      null
    ).bind(this);

    const loadUrl = "/" + library + "/admin/custom_lists";

    const loadAction = this.fetchJSON<CustomListsData>(
      ActionCreator.CUSTOM_LISTS_AFTER_SHARE,
      loadUrl
    ).bind(this);

    return ((dispatch) => {
      dispatch({
        type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.REQUEST}`,
        listId,
      });

      return dispatch(shareAction)
        .then(() => dispatch(loadAction))
        .then((data) =>
          Promise.all([
            // Dispatch CUSTOM_LISTS_LOAD to update the sidebar.

            dispatch({
              type: `${ActionCreator.CUSTOM_LISTS}_${ActionCreator.LOAD}`,
              data,
              isAfterShare: true,
            }),

            // Dispatch CUSTOM_LIST_SHARE_SUCCESS to update the custom list editor.

            dispatch({
              type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.SUCCESS}`,
              listId,
              data,
            }),
          ])
        )
        .catch((error) =>
          dispatch({
            type: `${ActionCreator.CUSTOM_LIST_SHARE}_${ActionCreator.FAILURE}`,
            listId,
            error,
          })
        );
    }).bind(this);
  }

  openCustomListEditor(listId: string) {
    return (dispatch, getState) => {
      dispatch(this.clear(ActionCreator.CUSTOM_LIST_DETAILS));

      return dispatch({
        type: ActionCreator.OPEN_CUSTOM_LIST_EDITOR,
        id: listId,
        data: getState().editor.customLists.data,
      });
    };
  }

  updateCustomListEditorProperty(name: string, value) {
    return {
      type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_PROPERTY,
      name,
      value,
    };
  }

  toggleCustomListEditorCollection(id: number) {
    return {
      type: ActionCreator.TOGGLE_CUSTOM_LIST_EDITOR_COLLECTION,
      id,
    };
  }

  updateCustomListEditorSearchParam(name: string, value) {
    return {
      type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_SEARCH_PARAM,
      name,
      value,
    };
  }

  updateClearFiltersFlag(builderName: string, value: boolean) {
    return {
      type: ActionCreator.UPDATE_CLEAR_FILTERS_FLAG,
      builderName,
      value,
    };
  }

  addCustomListEditorAdvSearchQuery(
    builderName: string,
    query: AdvancedSearchQuery
  ) {
    return {
      type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
      builderName,
      query,
    };
  }

  updateCustomListEditorAdvSearchQueryBoolean(
    builderName: string,
    id: string,
    bool: string
  ) {
    return {
      type: ActionCreator.UPDATE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY_BOOLEAN,
      builderName,
      id,
      bool,
    };
  }

  moveCustomListEditorAdvSearchQuery(
    builderName: string,
    id: string,
    targetId: string
  ) {
    return {
      type: ActionCreator.MOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
      builderName,
      id,
      targetId,
    };
  }

  removeCustomListEditorAdvSearchQuery(builderName: string, id: string) {
    return {
      type: ActionCreator.REMOVE_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
      builderName,
      id,
    };
  }

  selectCustomListEditorAdvSearchQuery(builderName: string, id: string) {
    return {
      type: ActionCreator.SELECT_CUSTOM_LIST_EDITOR_ADV_SEARCH_QUERY,
      builderName,
      id,
    };
  }

  addCustomListEditorEntry(id: string) {
    return (dispatch, getState) =>
      dispatch({
        type: ActionCreator.ADD_CUSTOM_LIST_EDITOR_ENTRY,
        id,
        data: getState().editor.collection.data,
      });
  }

  addAllCustomListEditorEntries() {
    return (dispatch, getState) =>
      dispatch({
        type: ActionCreator.ADD_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
        data: getState().editor.collection.data,
      });
  }

  deleteCustomListEditorEntry(id: string) {
    return {
      type: ActionCreator.DELETE_CUSTOM_LIST_EDITOR_ENTRY,
      id,
    };
  }

  deleteAllCustomListEditorEntries() {
    return {
      type: ActionCreator.DELETE_ALL_CUSTOM_LIST_EDITOR_ENTRIES,
    };
  }

  resetCustomListEditor() {
    return {
      type: ActionCreator.RESET_CUSTOM_LIST_EDITOR,
    };
  }

  saveCustomListEditor(library: string) {
    return (dispatch, getState) => {
      const { customListEditor } = getState().editor;
      const { id } = customListEditor;

      return dispatch(
        this.editCustomList(
          library,
          getCustomListEditorFormData(customListEditor),
          id
        )
      ).then(() => {
        const { successMessage: savedListId } = getState().editor.customLists;

        if (id === null && savedListId) {
          window.location.href = `/admin/web/lists/${library}/edit/${savedListId}`;
        }
      });
    };
  }

  executeCustomListEditorSearch(library: string) {
    return (dispatch, getState) => {
      const { customListEditor } = getState().editor;
      const url = getCustomListEditorSearchUrl(customListEditor, library);

      if (url) {
        return dispatch(this.fetchCollection(url));
      }

      // If there isn't a viable search URL (i.e, no filters have been added to the advanced search
      // query), just clear the results.

      return dispatch(this.clear(ActionCreator.COLLECTION));
    };
  }

  fetchMoreCustomListEditorSearchResults() {
    return (dispatch, getState) => {
      const { data, isFetchingPage } = getState().editor.collection;

      if (!isFetchingPage) {
        return dispatch(this.fetchPage(data.nextPageUrl));
      }
    };
  }

  changePassword(data: FormData) {
    const url = "/admin/change_password";
    return this.postForm(ActionCreator.CHANGE_PASSWORD, url, data).bind(this);
  }

  patronLookup(data: FormData, library: string) {
    const url = "/" + library + "/admin/manage_patrons";
    return this.postForm(
      ActionCreator.PATRON_LOOKUP,
      url,
      data,
      "POST",
      "",
      "JSON"
    ).bind(this);
  }

  resetAdobeId(data: FormData, library: string) {
    const url = "/" + library + "/admin/manage_patrons/reset_adobe_id";
    return this.postForm(ActionCreator.RESET_ADOBE_ID, url, data).bind(this);
  }

  clearPatronData() {
    return (dispatch) =>
      dispatch(this.load<void>(ActionCreator.CLEAR_PATRON_DATA, null));
  }

  setFeatureFlags(featureFlags: FeatureFlags) {
    return {
      type: ActionCreator.SET_FEATURE_FLAGS,
      value: featureFlags,
    };
  }

  updateFeatureFlag(name: string, value: string) {
    return {
      type: ActionCreator.UPDATE_FEATURE_FLAG,
      name,
      value,
    };
  }

  fetchQuicksightEmbedUrl(dashboardId: string, ld: LibrariesData) {
    /* Too many libraries will blow up the 8K cloudfront/nginx max url size limit.
       By not sending any uuids, the client will assemble a list of libraries based
       on the user's permissions.
    */
    let library_uuids: string = "";
    if (ld.libraries.length < 100) {
      library_uuids = `?libraryUuids=${ld.libraries
        .map((l) => l.uuid)
        .join(",")}`;
    }
    const url = `/admin/quicksight_embed/${dashboardId}${library_uuids}`;
    return this.fetchJSON<QuickSightEmbeddedURLData>(
      ActionCreator.QUICKSIGHT_EMBEDDED_URL,
      url
    ).bind(this);
  }
}
