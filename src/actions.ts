import { BookData, ComplaintsData, GenreTree, ClassificationData, CirculationEventData, StatsData, LibrariesData, CollectionsData } from "./interfaces";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { RequestError, RequestRejector } from "opds-web-client/lib/DataFetcher";
import BaseActionCreator from "opds-web-client/lib/actions";

export default class ActionCreator extends BaseActionCreator {
  static readonly EDIT_BOOK = "EDIT_BOOK";
  static readonly BOOK_ADMIN = "BOOK_ADMIN";
  static readonly COMPLAINTS = "COMPLAINTS";
  static readonly POST_COMPLAINT = "POST_COMPLAINT";
  static readonly RESOLVE_COMPLAINTS = "RESOLVE_COMPLAINTS";
  static readonly GENRE_TREE = "GENRE_TREE";
  static readonly CLASSIFICATIONS = "CLASSIFICATIONS";
  static readonly EDIT_CLASSIFICATIONS = "EDIT_CLASSIFICATIONS";
  static readonly CIRCULATION_EVENTS = "CIRCULATION_EVENTS";
  static readonly STATS = "STATS";
  static readonly LIBRARIES = "LIBRARIES";
  static readonly EDIT_LIBRARY = "EDIT_LIBRARY";
  static readonly COLLECTIONS = "COLLECTIONS";
  static readonly EDIT_COLLECTION = "EDIT_COLLECTION";

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

  static readonly LIBRARIES_REQUEST = "LIBRARIES_REQUEST";
  static readonly LIBRARIES_SUCCESS = "LIBRARIES_SUCCESS";
  static readonly LIBRARIES_FAILURE = "LIBRARIES_FAILURE";
  static readonly LIBRARIES_LOAD = "LIBRARIES_LOAD";

  static readonly EDIT_LIBRARY_REQUEST = "EDIT_LIBRARY_REQUEST";
  static readonly EDIT_LIBRARY_SUCCESS = "EDIT_LIBRARY_SUCCESS";
  static readonly EDIT_LIBRARY_FAILURE = "EDIT_LIBRARY_FAILURE";

  static readonly COLLECTIONS_REQUEST = "COLLECTIONS_REQUEST";
  static readonly COLLECTIONS_SUCCESS = "COLLECTIONS_SUCCESS";
  static readonly COLLECTIONS_FAILURE = "COLLECTIONS_FAILURE";
  static readonly COLLECTIONS_LOAD = "COLLECTIONS_LOAD";

  static readonly EDIT_COLLECTION_REQUEST = "EDIT_COLLECTION_REQUEST";
  static readonly EDIT_COLLECTION_SUCCESS = "EDIT_COLLECTION_SUCCESS";
  static readonly EDIT_COLLECTION_FAILURE = "EDIT_COLLECTION_FAILURE";

  constructor(fetcher?: DataFetcher) {
    fetcher = fetcher || new DataFetcher();
    super(fetcher);
  }

  postForm(type: string, url: string, data: FormData) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.request(type));
        fetch(url, {
          method: "POST",
          body: data,
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
                response: "Failed to save changes",
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
        fetch(url, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
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

  editBook(url: string, data: FormData) {
    return this.postForm(ActionCreator.EDIT_BOOK, url, data).bind(this);
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

  fetchCollections() {
    let url = "/admin/collections";
    return this.fetchJSON<CollectionsData>(ActionCreator.COLLECTIONS, url).bind(this);
  }

  editCollection(data: FormData) {
    const url = "/admin/collections";
    return this.postForm(ActionCreator.EDIT_COLLECTION, url, data).bind(this);
  }
}