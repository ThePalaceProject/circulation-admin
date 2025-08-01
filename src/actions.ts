import {
  AdvancedSearchQuery,
  ComplaintsData,
  GenreTree,
  ClassificationData,
  LibrariesData,
  CollectionsData,
  IndividualAdminsData,
  PatronAuthServicesData,
  MetadataServicesData,
  DiscoveryServicesData,
  LibraryRegistrationsData,
  CustomListsData,
  LanesData,
  LaneData,
  RolesData,
  MediaData,
  LanguagesData,
  RightsStatusData,
  CatalogServicesData,
  SelfTestsData,
  DiagnosticsData,
  FeatureFlags,
  SitewideAnnouncementsData,
  StatisticsData,
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
  static readonly ROLES = "ROLES";
  static readonly MEDIA = "MEDIA";
  static readonly LANGUAGES = "LANGUAGES";
  static readonly RIGHTS_STATUSES = "RIGHTS_STATUSES";
  static readonly COMPLAINTS = "COMPLAINTS";
  static readonly POST_COMPLAINT = "POST_COMPLAINT";
  static readonly RESOLVE_COMPLAINTS = "RESOLVE_COMPLAINTS";
  static readonly GENRE_TREE = "GENRE_TREE";
  static readonly CLASSIFICATIONS = "CLASSIFICATIONS";
  static readonly EDIT_CLASSIFICATIONS = "EDIT_CLASSIFICATIONS";
  static readonly BOOK_COVER = "BOOK_COVER";
  static readonly EDIT_BOOK_COVER = "EDIT_BOOK_COVER";
  static readonly PREVIEW_BOOK_COVER = "PREVIEW_BOOK_COVER";
  static readonly CUSTOM_LISTS_FOR_BOOK = "CUSTOM_LISTS_FOR_BOOK";
  static readonly EDIT_CUSTOM_LISTS_FOR_BOOK = "EDIT_CUSTOM_LISTS_FOR_BOOK";
  static readonly LIBRARIES = "LIBRARIES";
  static readonly EDIT_LIBRARY = "EDIT_LIBRARY";
  static readonly DELETE_LIBRARY = "DELETE_LIBRARY";
  static readonly COLLECTIONS = "COLLECTIONS";
  static readonly EDIT_COLLECTION = "EDIT_COLLECTION";
  static readonly DELETE_COLLECTION = "DELETE_COLLECTION";
  static readonly INDIVIDUAL_ADMINS = "INDIVIDUAL_ADMINS";
  static readonly EDIT_INDIVIDUAL_ADMIN = "EDIT_INDIVIDUAL_ADMIN";
  static readonly DELETE_INDIVIDUAL_ADMIN = "DELETE_INDIVIDUAL_ADMIN";
  static readonly PATRON_AUTH_SERVICES = "PATRON_AUTH_SERVICES";
  static readonly EDIT_PATRON_AUTH_SERVICE = "EDIT_PATRON_AUTH_SERVICE";
  static readonly DELETE_PATRON_AUTH_SERVICE = "DELETE_PATRON_AUTH_SERVICE";
  static readonly SITEWIDE_ANNOUNCEMENTS = "SITEWIDE_ANNOUNCEMENTS";
  static readonly EDIT_SITEWIDE_ANNOUNCEMENTS = "EDIT_SITEWIDE_ANNOUNCEMENTS";
  static readonly METADATA_SERVICES = "METADATA_SERVICES";
  static readonly EDIT_METADATA_SERVICE = "EDIT_METADATA_SERVICE";
  static readonly DELETE_METADATA_SERVICE = "DELETE_METADATA_SERVICE";
  static readonly CATALOG_SERVICES = "CATALOG_SERVICES";
  static readonly EDIT_CATALOG_SERVICE = "EDIT_CATALOG_SERVICE";
  static readonly DELETE_CATALOG_SERVICE = "DELETE_CATALOG_SERVICE";
  static readonly DISCOVERY_SERVICES = "DISCOVERY_SERVICES";
  static readonly EDIT_DISCOVERY_SERVICE = "EDIT_DISCOVERY_SERVICE";
  static readonly DELETE_DISCOVERY_SERVICE = "DELETE_DISCOVERY_SERVICE";
  static readonly REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE =
    "REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE";
  static readonly DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS =
    "DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS";
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
  static readonly LANES = "LANES";
  static readonly EDIT_LANE = "EDIT_LANE";
  static readonly DELETE_LANE = "DELETE_LANE";
  static readonly CHANGE_LANE_VISIBILITY = "CHANGE_LANE_VISIBILITY";
  static readonly RESET_LANES = "RESET_LANES";
  static readonly CHANGE_LANE_ORDER = "CHANGE_LANE_ORDER";

  static readonly COMPLAINTS_REQUEST = "COMPLAINTS_REQUEST";
  static readonly COMPLAINTS_SUCCESS = "COMPLAINTS_SUCCESS";
  static readonly COMPLAINTS_FAILURE = "COMPLAINTS_FAILURE";
  static readonly COMPLAINTS_LOAD = "COMPLAINTS_LOAD";

  static readonly POST_COMPLAINT_REQUEST = "POST_COMPLAINT_REQUEST";
  static readonly POST_COMPLAINT_SUCCESS = "POST_COMPLAINT_SUCCESS";
  static readonly POST_COMPLAINT_FAILURE = "POST_COMPLAINT_FAILURE";

  static readonly RESOLVE_COMPLAINTS_REQUEST = "RESOLVE_COMPLAINTS_REQUEST";
  static readonly RESOLVE_COMPLAINTS_SUCCESS = "RESOLVE_COMPLAINTS_SUCCESS";
  static readonly RESOLVE_COMPLAINTS_FAILURE = "RESOLVE_COMPLAINTS_FAILURE";

  static readonly GENRE_TREE_REQUEST = "GENRE_TREE_REQUEST";
  static readonly GENRE_TREE_SUCCESS = "GENRE_TREE_SUCCESS";
  static readonly GENRE_TREE_FAILURE = "GENRE_TREE_FAILURE";
  static readonly GENRE_TREE_LOAD = "GENRE_TREE_LOAD";

  static readonly CLASSIFICATIONS_REQUEST = "CLASSIFICATIONS_REQUEST";
  static readonly CLASSIFICATIONS_SUCCESS = "CLASSIFICATIONS_SUCCESS";
  static readonly CLASSIFICATIONS_FAILURE = "CLASSIFICATIONS_FAILURE";
  static readonly CLASSIFICATIONS_LOAD = "CLASSIFICATIONS_LOAD";

  static readonly EDIT_CLASSIFICATIONS_REQUEST = "EDIT_CLASSIFICATIONS_REQUEST";
  static readonly EDIT_CLASSIFICATIONS_SUCCESS = "EDIT_CLASSIFICATIONS_SUCCESS";
  static readonly EDIT_CLASSIFICATIONS_FAILURE = "EDIT_CLASSIFICATIONS_FAILURE";

  static readonly CIRCULATION_EVENTS_REQUEST = "CIRCULATION_EVENTS_REQUEST";
  static readonly CIRCULATION_EVENTS_SUCCESS = "CIRCULATION_EVENTS_SUCCESS";
  static readonly CIRCULATION_EVENTS_FAILURE = "CIRCULATION_EVENTS_FAILURE";
  static readonly CIRCULATION_EVENTS_LOAD = "CIRCULATION_EVENTS_LOAD";

  static readonly CHANGE_PASSWORD = "CHANGE_PASSWORD";

  static readonly GET_SELF_TESTS = "GET_SELF_TESTS";
  static readonly RUN_SELF_TESTS = "RUN_SELF_TESTS";

  static readonly PATRON_LOOKUP = "PATRON_LOOKUP";
  static readonly CLEAR_PATRON_DATA = "CLEAR_PATRON_DATA";
  static readonly RESET_ADOBE_ID = "RESET_ADOBE_ID";

  static readonly DIAGNOSTICS = "DIAGNOSTICS";
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
                .catch((parseError) => {
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
                .catch((parseError) => {
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

  fetchRoles() {
    const url = "/admin/roles";
    return this.fetchJSON<RolesData>(ActionCreator.ROLES, url).bind(this);
  }

  fetchMedia() {
    const url = "/admin/media";
    return this.fetchJSON<MediaData>(ActionCreator.MEDIA, url).bind(this);
  }

  fetchLanguages() {
    const url = "/admin/languages";
    return this.fetchJSON<LanguagesData>(ActionCreator.LANGUAGES, url).bind(
      this
    );
  }

  fetchRightsStatuses() {
    const url = "/admin/rights_status";
    return this.fetchJSON<RightsStatusData>(
      ActionCreator.RIGHTS_STATUSES,
      url
    ).bind(this);
  }

  fetchComplaints(url: string) {
    return this.fetchJSON<ComplaintsData>(ActionCreator.COMPLAINTS, url).bind(
      this
    );
  }

  postComplaint(url: string, data: { type: string }) {
    return this.postJSON<{ type: string }>(
      ActionCreator.POST_COMPLAINT,
      url,
      data
    ).bind(this);
  }

  resolveComplaints(url: string, data: FormData) {
    return this.postForm(ActionCreator.RESOLVE_COMPLAINTS, url, data).bind(
      this
    );
  }

  fetchGenreTree(url: string) {
    return this.fetchJSON<GenreTree>(ActionCreator.GENRE_TREE, url).bind(this);
  }

  editClassifications(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_CLASSIFICATIONS, url, data).bind(
      this
    );
  }

  fetchClassifications(url: string) {
    return this.fetchJSON<{ classifications: ClassificationData[] }>(
      ActionCreator.CLASSIFICATIONS,
      url
    ).bind(this);
  }

  editBookCover(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_BOOK_COVER, url, data).bind(this);
  }

  fetchBookCoverPreview(url: string, data: FormData) {
    return this.postForm(
      ActionCreator.PREVIEW_BOOK_COVER,
      url,
      data,
      "POST",
      "Could not load preview"
    ).bind(this);
  }

  clearBookCoverPreview() {
    return this.clear(ActionCreator.PREVIEW_BOOK_COVER);
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

  fetchLibraries() {
    const url = "/admin/libraries";
    return this.fetchJSON<LibrariesData>(ActionCreator.LIBRARIES, url).bind(
      this
    );
  }

  editLibrary(data: FormData) {
    const url = "/admin/libraries";
    return this.postForm(ActionCreator.EDIT_LIBRARY, url, data).bind(this);
  }

  deleteLibrary(identifier: string | number) {
    const url = "/admin/library/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_LIBRARY,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchCollections() {
    const url = "/admin/collections";
    return this.fetchJSON<CollectionsData>(ActionCreator.COLLECTIONS, url).bind(
      this
    );
  }

  editCollection(data: FormData) {
    const url = "/admin/collections";
    return this.postForm(ActionCreator.EDIT_COLLECTION, url, data).bind(this);
  }

  deleteCollection(identifier: string | number) {
    const url = "/admin/collection/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_COLLECTION,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchIndividualAdmins() {
    const url = "/admin/individual_admins";
    return this.fetchJSON<IndividualAdminsData>(
      ActionCreator.INDIVIDUAL_ADMINS,
      url
    ).bind(this);
  }

  editIndividualAdmin(data: FormData) {
    const url = "/admin/individual_admins";
    return this.postForm(ActionCreator.EDIT_INDIVIDUAL_ADMIN, url, data).bind(
      this
    );
  }

  deleteIndividualAdmin(identifier: string | number) {
    const url = "/admin/individual_admin/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_INDIVIDUAL_ADMIN,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchPatronAuthServices() {
    const url = "/admin/patron_auth_services";
    return this.fetchJSON<PatronAuthServicesData>(
      ActionCreator.PATRON_AUTH_SERVICES,
      url
    ).bind(this);
  }

  editPatronAuthService(data: FormData) {
    const url = "/admin/patron_auth_services";
    return this.postForm(
      ActionCreator.EDIT_PATRON_AUTH_SERVICE,
      url,
      data
    ).bind(this);
  }

  deletePatronAuthService(identifier: string | number) {
    const url = "/admin/patron_auth_service/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_PATRON_AUTH_SERVICE,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchMetadataServices() {
    const url = "/admin/metadata_services";
    return this.fetchJSON<MetadataServicesData>(
      ActionCreator.METADATA_SERVICES,
      url
    ).bind(this);
  }

  editMetadataService(data: FormData) {
    const url = "/admin/metadata_services";
    return this.postForm(ActionCreator.EDIT_METADATA_SERVICE, url, data).bind(
      this
    );
  }

  deleteMetadataService(identifier: string | number) {
    const url = "/admin/metadata_service/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_METADATA_SERVICE,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchCatalogServices() {
    const url = "/admin/catalog_services";
    return this.fetchJSON<CatalogServicesData>(
      ActionCreator.CATALOG_SERVICES,
      url
    ).bind(this);
  }

  editCatalogService(data: FormData) {
    const url = "/admin/catalog_services";
    return this.postForm(ActionCreator.EDIT_CATALOG_SERVICE, url, data).bind(
      this
    );
  }

  deleteCatalogService(identifier: string | number) {
    const url = "/admin/catalog_service/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_CATALOG_SERVICE,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  fetchDiscoveryServices() {
    const url = "/admin/discovery_services";
    return this.fetchJSON<DiscoveryServicesData>(
      ActionCreator.DISCOVERY_SERVICES,
      url
    ).bind(this);
  }

  editDiscoveryService(data: FormData) {
    const url = "/admin/discovery_services";
    return this.postForm(ActionCreator.EDIT_DISCOVERY_SERVICE, url, data).bind(
      this
    );
  }

  deleteDiscoveryService(identifier: string | number) {
    const url = "/admin/discovery_service/" + identifier;
    return this.postForm(
      ActionCreator.DELETE_DISCOVERY_SERVICE,
      url,
      null,
      "DELETE"
    ).bind(this);
  }

  registerLibraryWithDiscoveryService(data: FormData) {
    const url = "/admin/discovery_service_library_registrations";
    return this.postForm(
      ActionCreator.REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE,
      url,
      data
    ).bind(this);
  }

  fetchDiscoveryServiceLibraryRegistrations() {
    const url = "/admin/discovery_service_library_registrations";
    return this.fetchJSON<LibraryRegistrationsData>(
      ActionCreator.DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS,
      url
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

  fetchLanes(library: string) {
    const url = "/" + library + "/admin/lanes";
    return this.fetchJSON<LanesData>(ActionCreator.LANES, url).bind(this);
  }

  editLane(library: string, data: FormData) {
    const url = "/" + library + "/admin/lanes";
    return this.postForm(ActionCreator.EDIT_LANE, url, data).bind(this);
  }

  deleteLane(library: string, identifier: string) {
    const url = "/" + library + "/admin/lane/" + identifier;
    return this.postForm(ActionCreator.DELETE_LANE, url, null, "DELETE").bind(
      this
    );
  }

  showLane(library: string, identifier: string) {
    const url = "/" + library + "/admin/lane/" + identifier + "/show";
    return this.postForm(ActionCreator.CHANGE_LANE_VISIBILITY, url, null).bind(
      this
    );
  }

  hideLane(library: string, identifier: string) {
    const url = "/" + library + "/admin/lane/" + identifier + "/hide";
    return this.postForm(ActionCreator.CHANGE_LANE_VISIBILITY, url, null).bind(
      this
    );
  }

  resetLanes(library: string) {
    const url = "/" + library + "/admin/lanes/reset";
    return this.postForm(ActionCreator.RESET_LANES, url, null).bind(this);
  }

  changeLaneOrder(library: string, lanes: LaneData[]) {
    const url = "/" + library + "/admin/lanes/change_order";
    return this.postJSON<LaneData[]>(
      ActionCreator.CHANGE_LANE_ORDER,
      url,
      lanes
    ).bind(this);
  }

  changePassword(data: FormData) {
    const url = "/admin/change_password";
    return this.postForm(ActionCreator.CHANGE_PASSWORD, url, data).bind(this);
  }

  getSelfTests(url: string) {
    return this.fetchJSON<SelfTestsData>(
      ActionCreator.GET_SELF_TESTS,
      url
    ).bind(this);
  }

  runSelfTests(url: string) {
    return this.postForm(ActionCreator.RUN_SELF_TESTS, url, null).bind(this);
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

  fetchDiagnostics() {
    const url = "/admin/diagnostics";
    return this.fetchJSON<DiagnosticsData>(ActionCreator.DIAGNOSTICS, url).bind(
      this
    );
  }

  fetchSitewideAnnouncements() {
    const url = "/admin/announcements";
    return this.fetchJSON<SitewideAnnouncementsData>(
      ActionCreator.SITEWIDE_ANNOUNCEMENTS,
      url
    ).bind(this);
  }

  editSitewideAnnouncements(data: FormData) {
    const url = "/admin/announcements";
    return this.postForm(
      ActionCreator.EDIT_SITEWIDE_ANNOUNCEMENTS,
      url,
      data
    ).bind(this);
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
    const library_uuids: string = ld.libraries.map((l) => l.uuid).join(",");
    const url = `/admin/quicksight_embed/${dashboardId}?libraryUuids=${library_uuids}`;
    return this.fetchJSON<QuickSightEmbeddedURLData>(
      ActionCreator.QUICKSIGHT_EMBEDDED_URL,
      url
    ).bind(this);
  }
}
