import {
  BookData, ComplaintsData, GenreTree, ClassificationData,
  CirculationEventData, StatsData,
  LibrariesData, CollectionsData,
  AdminAuthServicesData, IndividualAdminsData,
  PatronAuthServicesData, SitewideSettingsData,
  MetadataServicesData, AnalyticsServicesData,
  CDNServicesData, SearchServicesData,
  DiscoveryServicesData, LibraryRegistrationsData,
  CustomListsData, LanesData,
  RolesData, MediaData, LanguagesData, RightsStatusData,
  StorageServicesData, LoggingServicesData, CatalogServicesData,
  SelfTestsData, PatronData
} from "./interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { RequestError, RequestRejector } from "opds-web-client/lib/DataFetcher";
import BaseActionCreator from "opds-web-client/lib/actions";

/** Create redux actions to be dispatched by connected components, mostly
    to make requests to the server. */
export default class ActionCreator extends BaseActionCreator {
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
  static readonly CIRCULATION_EVENTS = "CIRCULATION_EVENTS";
  static readonly STATS = "STATS";
  static readonly LIBRARIES = "LIBRARIES";
  static readonly EDIT_LIBRARY = "EDIT_LIBRARY";
  static readonly DELETE_LIBRARY = "DELETE_LIBRARY";
  static readonly COLLECTIONS = "COLLECTIONS";
  static readonly EDIT_COLLECTION = "EDIT_COLLECTION";
  static readonly DELETE_COLLECTION = "DELETE_COLLECTION";
  static readonly ADMIN_AUTH_SERVICES = "ADMIN_AUTH_SERVICES";
  static readonly EDIT_ADMIN_AUTH_SERVICE = "EDIT_ADMIN_AUTH_SERVICE";
  static readonly DELETE_ADMIN_AUTH_SERVICE = "DELETE_ADMIN_AUTH_SERVICE";
  static readonly INDIVIDUAL_ADMINS = "INDIVIDUAL_ADMINS";
  static readonly EDIT_INDIVIDUAL_ADMIN = "EDIT_INDIVIDUAL_ADMIN";
  static readonly DELETE_INDIVIDUAL_ADMIN = "DELETE_INDIVIDUAL_ADMIN";
  static readonly PATRON_AUTH_SERVICES = "PATRON_AUTH_SERVICES";
  static readonly EDIT_PATRON_AUTH_SERVICE = "EDIT_PATRON_AUTH_SERVICE";
  static readonly DELETE_PATRON_AUTH_SERVICE = "DELETE_PATRON_AUTH_SERVICE";
  static readonly SITEWIDE_SETTINGS = "SITEWIDE_SETTINGS";
  static readonly EDIT_SITEWIDE_SETTING = "EDIT_SITEWIDE_SETTING";
  static readonly DELETE_SITEWIDE_SETTING = "DELETE_SITEWIDE_SETTING";
  static readonly LOGGING_SERVICES = "LOGGING_SERVICES";
  static readonly EDIT_LOGGING_SERVICE = "EDIT_LOGGING_SERVICE";
  static readonly DELETE_LOGGING_SERVICE = "DELETE_LOGGING_SERVICE";
  static readonly METADATA_SERVICES = "METADATA_SERVICES";
  static readonly EDIT_METADATA_SERVICE = "EDIT_METADATA_SERVICE";
  static readonly DELETE_METADATA_SERVICE = "DELETE_METADATA_SERVICE";
  static readonly ANALYTICS_SERVICES = "ANALYTICS_SERVICES";
  static readonly EDIT_ANALYTICS_SERVICE = "EDIT_ANALYTICS_SERVICE";
  static readonly DELETE_ANALYTICS_SERVICE = "DELETE_ANALYTICS_SERVICE";
  static readonly CDN_SERVICES = "CDN_SERVICES";
  static readonly EDIT_CDN_SERVICE = "EDIT_CDN_SERVICE";
  static readonly DELETE_CDN_SERVICE = "DELETE_CDN_SERVICE";
  static readonly SEARCH_SERVICES = "SEARCH_SERVICES";
  static readonly EDIT_SEARCH_SERVICE = "EDIT_SEARCH_SERVICE";
  static readonly DELETE_SEARCH_SERVICE = "DELETE_SEARCH_SERVICE";
  static readonly STORAGE_SERVICES = "STORAGE_SERVICES";
  static readonly EDIT_STORAGE_SERVICE = "EDIT_STORAGE_SERVICE";
  static readonly DELETE_STORAGE_SERVICE = "DELETE_STORAGE_SERVICE";
  static readonly CATALOG_SERVICES = "CATALOG_SERVICES";
  static readonly EDIT_CATALOG_SERVICE = "EDIT_CATALOG_SERVICE";
  static readonly DELETE_CATALOG_SERVICE = "DELETE_CATALOG_SERVICE";
  static readonly DISCOVERY_SERVICES = "DISCOVERY_SERVICES";
  static readonly EDIT_DISCOVERY_SERVICE = "EDIT_DISCOVERY_SERVICE";
  static readonly DELETE_DISCOVERY_SERVICE = "DELETE_DISCOVERY_SERVICE";
  static readonly REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE = "REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE";
  static readonly DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS = "DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS";
  static readonly REGISTER_LIBRARY_WITH_COLLECTION = "REGISTER_LIBRARY_WITH_COLLECTION";
  static readonly COLLECTION_LIBRARY_REGISTRATIONS = "COLLECTION_LIBRARY_REGISTRATIONS";
  static readonly CUSTOM_LISTS = "CUSTOM_LISTS";
  static readonly CUSTOM_LIST_DETAILS = "CUSTOM_LIST_DETAILS";
  static readonly CUSTOM_LIST_DETAILS_MORE = "CUSTOM_LIST_DETAILS_MORE";
  static readonly EDIT_CUSTOM_LIST = "EDIT_CUSTOM_LIST";
  static readonly DELETE_CUSTOM_LIST = "DELETE_CUSTOM_LIST";
  static readonly LANES = "LANES";
  static readonly EDIT_LANE = "EDIT_LANE";
  static readonly DELETE_LANE = "DELETE_LANE";
  static readonly CHANGE_LANE_VISIBILITY = "CHANGE_LANE_VISIBILITY";
  static readonly RESET_LANES = "RESET_LANES";

  static readonly EDIT_BOOK_REQUEST = "EDIT_BOOK_REQUEST";
  static readonly EDIT_BOOK_SUCCESS = "EDIT_BOOK_SUCCESS";
  static readonly EDIT_BOOK_FAILURE = "EDIT_BOOK_FAILURE";
  static readonly BOOK_ADMIN_REQUEST = "BOOK_ADMIN_REQUEST";
  static readonly BOOK_ADMIN_SUCCESS = "BOOK_ADMIN_SUCCESS";
  static readonly BOOK_ADMIN_FAILURE = "BOOK_ADMIN_FAILURE";
  static readonly BOOK_ADMIN_LOAD = "BOOK_ADMIN_LOAD";

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

  static readonly STATS_REQUEST = "STATS_REQUEST";
  static readonly STATS_SUCCESS = "STATS_SUCCESS";
  static readonly STATS_FAILURE = "STATS_FAILURE";
  static readonly STATS_LOAD = "STATS_LOAD";

  static readonly CHANGE_PASSWORD = "CHANGE_PASSWORD";

  static readonly GET_SELF_TESTS = "GET_SELF_TESTS";
  static readonly RUN_SELF_TESTS = "RUN_SELF_TESTS";

  static readonly PATRON_LOOKUP = "PATRON_LOOKUP";
  static readonly CLEAR_PATRON_DATA = "CLEAR_PATRON_DATA";
  static readonly RESET_ADOBE_ID = "RESET_ADOBE_ID";

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
    returnType?: string,
  ) {
    let err: RequestError;
    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.request(type));
        let headers = new Headers();
        if (this.csrfToken) {
          headers.append("X-CSRF-Token", this.csrfToken);
        }
        fetch(url, {
          method: method || "POST",
          headers: headers,
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200 || response.status === 201) {
            dispatch(this.success(type));
            if (response.json && returnType === "JSON") {
              response.json().then(data => {
                dispatch(this.load<any>(type, data));
                resolve(response);
              });
            } else if (response.text) {
              response.text().then(text => {
                dispatch(this.load<string>(type, text));
                resolve(response);
              });
            } else {
              resolve(response);
            }
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.failure(type, err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: defaultErrorMessage || "Failed to save changes",
                url: url
              };
              dispatch(this.failure(type, err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.failure(type, err));
          reject(err);
        });
      });
    }).bind(this);
  }

  postJSON<T>(type: string, url: string, data: T) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.request(type, url));
        let headers = new Headers();
        if (this.csrfToken) {
          headers.append("X-CSRF-Token", this.csrfToken);
        }
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200 || response.status === 201) {
            dispatch(this.success(type));
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.failure(type, err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Request failed",
                url: url
              };
              dispatch(this.failure(type, err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.failure(type, err));
          reject(err);
        });
      });
    });
  }

  fetchBookAdmin(url: string) {
    return this.fetchOPDS<BookData>(ActionCreator.BOOK_ADMIN, url).bind(this);
  }

  editBook(url: string, data: FormData | null) {
    return this.postForm(ActionCreator.EDIT_BOOK, url, data).bind(this);
  }

  fetchRoles() {
    let url = "/admin/roles";
    return this.fetchJSON<RolesData>(ActionCreator.ROLES, url).bind(this);
  }

  fetchMedia() {
    let url = "/admin/media";
    return this.fetchJSON<MediaData>(ActionCreator.MEDIA, url).bind(this);
  }

  fetchLanguages() {
    let url = "/admin/languages";
    return this.fetchJSON<LanguagesData>(ActionCreator.LANGUAGES, url).bind(this);
  }

  fetchRightsStatuses() {
    let url = "/admin/rights_status";
    return this.fetchJSON<RightsStatusData>(ActionCreator.RIGHTS_STATUSES, url).bind(this);
  }

  fetchComplaints(url: string) {
    return this.fetchJSON<ComplaintsData>(ActionCreator.COMPLAINTS, url).bind(this);
  }

  postComplaint(url: string, data: { type: string }) {
    return this.postJSON<{type: string}>(ActionCreator.POST_COMPLAINT, url, data).bind(this);
  }

  resolveComplaints(url: string, data: FormData) {
    return this.postForm(ActionCreator.RESOLVE_COMPLAINTS, url, data).bind(this);
  }

  fetchGenreTree(url: string) {
    return this.fetchJSON<GenreTree>(ActionCreator.GENRE_TREE, url).bind(this);
  }

  editClassifications(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_CLASSIFICATIONS, url, data).bind(this);
  }

  fetchClassifications(url: string) {
    return this.fetchJSON<{ classifications: ClassificationData[] }>(ActionCreator.CLASSIFICATIONS, url).bind(this);
  }

  editBookCover(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_BOOK_COVER, url, data).bind(this);
  }

  fetchBookCoverPreview(url: string, data: FormData) {
    return this.postForm(ActionCreator.PREVIEW_BOOK_COVER, url, data, "POST", "Could not load preview").bind(this);
  }

  clearBookCoverPreview() {
    return this.clear(ActionCreator.PREVIEW_BOOK_COVER);
  }

  fetchCustomListsForBook(url: string) {
    return this.fetchJSON<CustomListsData>(ActionCreator.CUSTOM_LISTS_FOR_BOOK, url).bind(this);
  }

  editCustomListsForBook(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_CUSTOM_LISTS_FOR_BOOK, url, data).bind(this);
  }

  fetchCirculationEvents() {
    let url = "/admin/circulation_events";
    return this.fetchJSON<{ circulation_events: CirculationEventData[] }>(ActionCreator.CIRCULATION_EVENTS, url).bind(this);
  }

  fetchStats() {
    let url = "/admin/stats";
    return this.fetchJSON<StatsData>(ActionCreator.STATS, url).bind(this);
  }

  fetchLibraries() {
    let url = "/admin/libraries";
    return this.fetchJSON<LibrariesData>(ActionCreator.LIBRARIES, url).bind(this);
  }

  editLibrary(data: FormData) {
    const url = "/admin/libraries";
    return this.postForm(ActionCreator.EDIT_LIBRARY, url, data).bind(this);
  }

  deleteLibrary(identifier: string | number) {
    const url = "/admin/library/" + identifier;
    return this.postForm(ActionCreator.DELETE_LIBRARY, url, null, "DELETE").bind(this);
  }

  fetchCollections() {
    let url = "/admin/collections";
    return this.fetchJSON<CollectionsData>(ActionCreator.COLLECTIONS, url).bind(this);
  }

  editCollection(data: FormData) {
    const url = "/admin/collections";
    return this.postForm(ActionCreator.EDIT_COLLECTION, url, data).bind(this);
  }

  deleteCollection(identifier: string | number) {
    const url = "/admin/collection/" + identifier;
    return this.postForm(ActionCreator.DELETE_COLLECTION, url, null, "DELETE").bind(this);
  }

  fetchAdminAuthServices() {
    const url = "/admin/admin_auth_services";
    return this.fetchJSON<AdminAuthServicesData>(ActionCreator.ADMIN_AUTH_SERVICES, url).bind(this);
  }

  editAdminAuthService(data: FormData) {
    const url = "/admin/admin_auth_services";
    return this.postForm(ActionCreator.EDIT_ADMIN_AUTH_SERVICE, url, data).bind(this);
  }

  deleteAdminAuthService(identifier: string | number) {
    const url = "/admin/admin_auth_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_ADMIN_AUTH_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchIndividualAdmins() {
    const url = "/admin/individual_admins";
    return this.fetchJSON<IndividualAdminsData>(ActionCreator.INDIVIDUAL_ADMINS, url).bind(this);
  }

  editIndividualAdmin(data: FormData) {
    const url = "/admin/individual_admins";
    return this.postForm(ActionCreator.EDIT_INDIVIDUAL_ADMIN, url, data).bind(this);
  }

  deleteIndividualAdmin(identifier: string | number) {
    const url = "/admin/individual_admin/" + identifier;
    return this.postForm(ActionCreator.DELETE_INDIVIDUAL_ADMIN, url, null, "DELETE").bind(this);
  }

  fetchPatronAuthServices() {
    const url = "/admin/patron_auth_services";
    return this.fetchJSON<PatronAuthServicesData>(ActionCreator.PATRON_AUTH_SERVICES, url).bind(this);
  }

  editPatronAuthService(data: FormData) {
    const url = "/admin/patron_auth_services";
    return this.postForm(ActionCreator.EDIT_PATRON_AUTH_SERVICE, url, data).bind(this);
  }

  deletePatronAuthService(identifier: string | number) {
    const url = "/admin/patron_auth_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_PATRON_AUTH_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchSitewideSettings() {
    const url = "/admin/sitewide_settings";
    return this.fetchJSON<SitewideSettingsData>(ActionCreator.SITEWIDE_SETTINGS, url).bind(this);
  }

  editSitewideSetting(data: FormData) {
    const url = "/admin/sitewide_settings";
    return this.postForm(ActionCreator.EDIT_SITEWIDE_SETTING, url, data).bind(this);
  }

  deleteSitewideSetting(identifier: string | number) {
    const url = "/admin/sitewide_setting/" + identifier;
    return this.postForm(ActionCreator.DELETE_SITEWIDE_SETTING, url, null, "DELETE").bind(this);
  }

  fetchLoggingServices() {
    const url = "/admin/logging_services";
    return this.fetchJSON<LoggingServicesData>(ActionCreator.LOGGING_SERVICES, url).bind(this);
  }

  editLoggingService(data: FormData) {
    const url = "/admin/logging_services";
    return this.postForm(ActionCreator.EDIT_LOGGING_SERVICE, url, data).bind(this);
  }

  deleteLoggingService(identifier: string | number) {
    const url = "/admin/logging_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_LOGGING_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchMetadataServices() {
    const url = "/admin/metadata_services";
    return this.fetchJSON<MetadataServicesData>(ActionCreator.METADATA_SERVICES, url).bind(this);
  }

  editMetadataService(data: FormData) {
    const url = "/admin/metadata_services";
    return this.postForm(ActionCreator.EDIT_METADATA_SERVICE, url, data).bind(this);
  }

  deleteMetadataService(identifier: string | number) {
    const url = "/admin/metadata_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_METADATA_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchAnalyticsServices() {
    const url = "/admin/analytics_services";
    return this.fetchJSON<AnalyticsServicesData>(ActionCreator.ANALYTICS_SERVICES, url).bind(this);
  }

  editAnalyticsService(data: FormData) {
    const url = "/admin/analytics_services";
    return this.postForm(ActionCreator.EDIT_ANALYTICS_SERVICE, url, data).bind(this);
  }

  deleteAnalyticsService(identifier: string | number) {
    const url = "/admin/analytics_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_ANALYTICS_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchCDNServices() {
    const url = "/admin/cdn_services";
    return this.fetchJSON<CDNServicesData>(ActionCreator.CDN_SERVICES, url).bind(this);
  }

  editCDNService(data: FormData) {
    const url = "/admin/cdn_services";
    return this.postForm(ActionCreator.EDIT_CDN_SERVICE, url, data).bind(this);
  }

  deleteCDNService(identifier: string | number) {
    const url = "/admin/cdn_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_CDN_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchSearchServices() {
    const url = "/admin/search_services";
    return this.fetchJSON<SearchServicesData>(ActionCreator.SEARCH_SERVICES, url).bind(this);
  }

  editSearchService(data: FormData) {
    const url = "/admin/search_services";
    return this.postForm(ActionCreator.EDIT_SEARCH_SERVICE, url, data).bind(this);
  }

  deleteSearchService(identifier: string | number) {
    const url = "/admin/search_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_SEARCH_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchStorageServices() {
    const url = "/admin/storage_services";
    return this.fetchJSON<StorageServicesData>(ActionCreator.STORAGE_SERVICES, url).bind(this);
  }

  editStorageService(data: FormData) {
    const url = "/admin/storage_services";
    return this.postForm(ActionCreator.EDIT_STORAGE_SERVICE, url, data).bind(this);
  }

  deleteStorageService(identifier: string | number) {
    const url = "/admin/storage_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_STORAGE_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchCatalogServices() {
    const url = "/admin/catalog_services";
    return this.fetchJSON<CatalogServicesData>(ActionCreator.CATALOG_SERVICES, url).bind(this);
  }

  editCatalogService(data: FormData) {
    const url = "/admin/catalog_services";
    return this.postForm(ActionCreator.EDIT_CATALOG_SERVICE, url, data).bind(this);
  }

  deleteCatalogService(identifier: string | number) {
    const url = "/admin/catalog_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_CATALOG_SERVICE, url, null, "DELETE").bind(this);
  }

  fetchDiscoveryServices() {
    const url = "/admin/discovery_services";
    return this.fetchJSON<DiscoveryServicesData>(ActionCreator.DISCOVERY_SERVICES, url).bind(this);
  }

  editDiscoveryService(data: FormData) {
    const url = "/admin/discovery_services";
    return this.postForm(ActionCreator.EDIT_DISCOVERY_SERVICE, url, data).bind(this);
  }

  deleteDiscoveryService(identifier: string | number) {
    const url = "/admin/discovery_service/" + identifier;
    return this.postForm(ActionCreator.DELETE_DISCOVERY_SERVICE, url, null, "DELETE").bind(this);
  }

  registerLibraryWithDiscoveryService(data: FormData) {
    const url = "/admin/discovery_service_library_registrations";
    return this.postForm(ActionCreator.REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE, url, data).bind(this);
  }

  fetchDiscoveryServiceLibraryRegistrations() {
    const url = "/admin/discovery_service_library_registrations";
    return this.fetchJSON<LibraryRegistrationsData>(ActionCreator.DISCOVERY_SERVICE_LIBRARY_REGISTRATIONS, url).bind(this);
  }

  registerLibraryWithCollection(data: FormData) {
    const url = "/admin/collection_library_registrations";
    return this.postForm(ActionCreator.REGISTER_LIBRARY_WITH_COLLECTION, url, data).bind(this);
  }

  fetchCollectionLibraryRegistrations() {
    const url = "/admin/collection_library_registrations";
    return this.fetchJSON<LibraryRegistrationsData>(ActionCreator.COLLECTION_LIBRARY_REGISTRATIONS, url).bind(this);
  }

  fetchCustomLists(library: string) {
    const url = "/" + library + "/admin/custom_lists";
    return this.fetchJSON<CustomListsData>(ActionCreator.CUSTOM_LISTS, url).bind(this);
  }

  fetchCustomListDetails(library: string, id: string) {
    const url = "/" + library + "/admin/custom_list/" + id;
    return this.fetchOPDS<CollectionData>(ActionCreator.CUSTOM_LIST_DETAILS, url).bind(this);
  }

  fetchMoreCustomListEntries(url: string) {
    return this.fetchOPDS<CollectionData>(ActionCreator.CUSTOM_LIST_DETAILS_MORE, url).bind(this);
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
    return this.postForm(ActionCreator.DELETE_CUSTOM_LIST, url, null, "DELETE").bind(this);
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
    return this.postForm(ActionCreator.DELETE_LANE, url, null, "DELETE").bind(this);
  }

  showLane(library: string, identifier: string) {
    const url = "/" + library + "/admin/lane/" + identifier + "/show";
    return this.postForm(ActionCreator.CHANGE_LANE_VISIBILITY, url, null).bind(this);
  }

  hideLane(library: string, identifier: string) {
    const url = "/" + library + "/admin/lane/" + identifier + "/hide";
    return this.postForm(ActionCreator.CHANGE_LANE_VISIBILITY, url, null).bind(this);
  }

  resetLanes(library: string) {
    const url = "/" + library + "/admin/lanes/reset";
    return this.postForm(ActionCreator.RESET_LANES, url, null).bind(this);
  }

  changePassword(data: FormData) {
    const url = "/admin/change_password";
    return this.postForm(ActionCreator.CHANGE_PASSWORD, url, data).bind(this);
  }

  getSelfTests(url: string) {
    return this.fetchJSON<SelfTestsData>(ActionCreator.GET_SELF_TESTS, url).bind(this);
  }

  runSelfTests(url: string) {
    return this.postForm(ActionCreator.RUN_SELF_TESTS, url, null).bind(this);
  }

  patronLookup(data: FormData, library: string) {
    const url = "/" + library + "/admin/manage_patrons";
    return this.postForm(ActionCreator.PATRON_LOOKUP, url, data, "POST", "", "JSON").bind(this);
  }

  resetAdobeId(data: FormData, library: string) {
    const url = "/" + library + "/admin/manage_patrons/reset_adobe_id";
    return this.postForm(ActionCreator.RESET_ADOBE_ID, url, data).bind(this);
  }

  clearPatronData() {
    return (dispatch) => dispatch(this.load<void>(ActionCreator.CLEAR_PATRON_DATA, null));
  }

}
