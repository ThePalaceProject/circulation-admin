import { BookData, ComplaintsData, GenreTree, ClassificationData, CirculationEventData, StatsData, LibrariesData, CollectionsData } from "./interfaces";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { RequestError, RequestRejector } from "opds-web-client/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

  CLEAR_BOOK = "CLEAR_BOOK";

  EDIT_BOOK_REQUEST = "EDIT_BOOK_REQUEST";
  EDIT_BOOK_SUCCESS = "EDIT_BOOK_SUCCESS";
  EDIT_BOOK_FAILURE = "EDIT_BOOK_FAILURE";
  FETCH_BOOK_ADMIN_REQUEST = "FETCH_BOOK_ADMIN_REQUEST";
  FETCH_BOOK_ADMIN_SUCCESS = "FETCH_BOOK_ADMIN_SUCCESS";
  FETCH_BOOK_ADMIN_FAILURE = "FETCH_BOOK_ADMIN_FAILURE";
  LOAD_BOOK_ADMIN = "LOAD_BOOK_ADMIN";

  FETCH_COMPLAINTS_REQUEST = "FETCH_COMPLAINTS_REQUEST";
  FETCH_COMPLAINTS_SUCCESS = "FETCH_COMPLAINTS_SUCCESS";
  FETCH_COMPLAINTS_FAILURE = "FETCH_COMPLAINTS_FAILURE";
  LOAD_COMPLAINTS = "LOAD_COMPLAINTS";

  POST_COMPLAINT_REQUEST = "POST_COMPLAINT_REQUEST";
  POST_COMPLAINT_SUCCESS = "POST_COMPLAINT_SUCCESS";
  POST_COMPLAINT_FAILURE = "POST_COMPLAINT_FAILURE";

  RESOLVE_COMPLAINTS_REQUEST = "RESOLVE_COMPLAINTS_REQUEST";
  RESOLVE_COMPLAINTS_SUCCESS = "RESOLVE_COMPLAINTS_SUCCESS";
  RESOLVE_COMPLAINTS_FAILURE = "RESOLVE_COMPLAINTS_FAILURE";

  FETCH_GENRE_TREE_REQUEST = "FETCH_GENRE_TREE_REQUEST";
  FETCH_GENRE_TREE_SUCCESS = "FETCH_GENRE_TREE_SUCCESS";
  FETCH_GENRE_TREE_FAILURE = "FETCH_GENRE_TREE_FAILURE";
  LOAD_GENRE_TREE = "LOAD_GENRE_TREE";

  FETCH_CLASSIFICATIONS_REQUEST = "FETCH_CLASSIFICATIONS_REQUEST";
  FETCH_CLASSIFICATIONS_SUCCESS = "FETCH_CLASSIFICATIONS_SUCCESS";
  FETCH_CLASSIFICATIONS_FAILURE = "FETCH_CLASSIFICATIONS_FAILURE";
  LOAD_CLASSIFICATIONS = "LOAD_CLASSIFICATIONS";

  EDIT_CLASSIFICATIONS_REQUEST = "EDIT_CLASSIFICATIONS_REQUEST";
  EDIT_CLASSIFICATIONS_SUCCESS = "EDIT_CLASSIFICATIONS_SUCCESS";
  EDIT_CLASSIFICATIONS_FAILURE = "EDIT_CLASSIFICATIONS_FAILURE";

  FETCH_CIRCULATION_EVENTS_REQUEST = "FETCH_CIRCULATION_EVENTS_REQUEST";
  FETCH_CIRCULATION_EVENTS_SUCCESS = "FETCH_CIRCULATION_EVENTS_SUCCESS";
  FETCH_CIRCULATION_EVENTS_FAILURE = "FETCH_CIRCULATION_EVENTS_FAILURE";
  LOAD_CIRCULATION_EVENTS = "LOAD_CIRCULATION_EVENTS";

  FETCH_STATS_REQUEST = "FETCH_STATS_REQUEST";
  FETCH_STATS_SUCCESS = "FETCH_STATS_SUCCESS";
  FETCH_STATS_FAILURE = "FETCH_STATS_FAILURE";
  LOAD_STATS = "LOAD_STATS";

  FETCH_LIBRARIES_REQUEST = "FETCH_LIBRARIES_REQUEST";
  FETCH_LIBRARIES_SUCCESS = "FETCH_LIBRARIES_SUCCESS";
  FETCH_LIBRARIES_FAILURE = "FETCH_LIBRARIES_FAILURE";
  LOAD_LIBRARIES = "LOAD_LIBRARIES";

  EDIT_LIBRARY_REQUEST = "EDIT_LIBRARY_REQUEST";
  EDIT_LIBRARY_SUCCESS = "EDIT_LIBRARY_SUCCESS";
  EDIT_LIBRARY_FAILURE = "EDIT_LIBRARY_FAILURE";

  FETCH_COLLECTIONS_REQUEST = "FETCH_COLLECTIONS_REQUEST";
  FETCH_COLLECTIONS_SUCCESS = "FETCH_COLLECTIONS_SUCCESS";
  FETCH_COLLECTIONS_FAILURE = "FETCH_COLLECTIONS_FAILURE";
  LOAD_COLLECTIONS = "LOAD_COLLECTIONS";

  EDIT_COLLECTION_REQUEST = "EDIT_COLLECTION_REQUEST";
  EDIT_COLLECTION_SUCCESS = "EDIT_COLLECTION_SUCCESS";
  EDIT_COLLECTION_FAILURE = "EDIT_COLLECTION_FAILURE";

  constructor(fetcher?: DataFetcher) {
    this.fetcher = fetcher || new DataFetcher();
  }

  clearBook() {
    return { type: this.CLEAR_BOOK };
  }

  fetchBookAdmin(url: string) {
    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchBookAdminRequest(url));
        this.fetcher.fetchOPDSData(url).then((data: BookData) => {
          dispatch(this.fetchBookAdminSuccess());
          dispatch(this.loadBookAdmin(data, url));
          resolve(data);
        }).catch((err: RequestError) => {
          dispatch(this.fetchBookAdminFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchBookAdminRequest(url: string) {
    return { type: this.FETCH_BOOK_ADMIN_REQUEST, url };
  }

  fetchBookAdminSuccess() {
    return { type: this.FETCH_BOOK_ADMIN_SUCCESS };
  }

  fetchBookAdminFailure(error?: RequestError) {
    return { type: this.FETCH_BOOK_ADMIN_FAILURE, error };
  }

  loadBookAdmin(data: BookData, url: string) {
    return { type: this.LOAD_BOOK_ADMIN, data, url };
  }

  editBook(url: string, data: FormData) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.editBookRequest());
        fetch(url, {
          method: "POST",
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200) {
            dispatch(this.editBookSuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.editBookFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to save changes",
                url: url
              };
              dispatch(this.editBookFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.editBookFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  editBookRequest() {
    return { type: this.EDIT_BOOK_REQUEST };
  }

  editBookSuccess() {
    return { type: this.EDIT_BOOK_SUCCESS };
  }

  editBookFailure(error?: RequestError) {
    return { type: this.EDIT_BOOK_FAILURE, error };
  }

  fetchComplaints(url: string) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchComplaintsRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: ComplaintsData) => {
              dispatch(this.fetchComplaintsSuccess());
              dispatch(this.loadComplaints(data.complaints));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchComplaintsFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchComplaintsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve complaints",
                url: url
              };
              dispatch(this.fetchComplaintsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchComplaintsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchComplaintsRequest(url: string) {
    return { type: this.FETCH_COMPLAINTS_REQUEST, url };
  }

  fetchComplaintsSuccess() {
    return { type: this.FETCH_COMPLAINTS_SUCCESS };
  }

  fetchComplaintsFailure(error?: RequestError) {
    return { type: this.FETCH_COMPLAINTS_FAILURE, error };
  }

  loadComplaints(data) {
    return { type: this.LOAD_COMPLAINTS, data };
  }

  postComplaint(url: string, data: { type: string }) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.postComplaintRequest());
        fetch(url, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 201) {
            dispatch(this.postComplaintSuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.postComplaintFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to post complaint",
                url: url
              };
              dispatch(this.postComplaintFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.postComplaintFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  postComplaintRequest() {
    return { type: this.POST_COMPLAINT_REQUEST };
  }

  postComplaintSuccess() {
    return { type: this.POST_COMPLAINT_SUCCESS };
  }

  postComplaintFailure(error?: RequestError) {
    return { type: this.POST_COMPLAINT_FAILURE, error };
  }

  resolveComplaints(url: string, data: FormData) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.resolveComplaintsRequest());
        fetch(url, {
          method: "POST",
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200) {
            dispatch(this.resolveComplaintsSuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.resolveComplaintsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to resolve complaints",
                url: url
              };
              dispatch(this.resolveComplaintsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.resolveComplaintsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  resolveComplaintsRequest() {
    return { type: this.RESOLVE_COMPLAINTS_REQUEST };
  }

  resolveComplaintsSuccess() {
    return { type: this.RESOLVE_COMPLAINTS_SUCCESS };
  }

  resolveComplaintsFailure(error?: RequestError) {
    return { type: this.RESOLVE_COMPLAINTS_FAILURE, error };
  }

  fetchGenreTree(url: string) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchGenreTreeRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: GenreTree) => {
              dispatch(this.fetchGenreTreeSuccess());
              dispatch(this.loadGenreTree(data));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchGenreTreeFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchGenreTreeFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve genres",
                url: url
              };
              dispatch(this.fetchGenreTreeFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchGenreTreeFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchGenreTreeRequest(url: string) {
    return { type: this.FETCH_GENRE_TREE_REQUEST, url };
  }

  fetchGenreTreeSuccess() {
    return { type: this.FETCH_GENRE_TREE_SUCCESS };
  }

  fetchGenreTreeFailure(error?: RequestError) {
    return { type: this.FETCH_GENRE_TREE_FAILURE, error };
  }

  loadGenreTree(data) {
    return { type: this.LOAD_GENRE_TREE, data };
  }

  editClassifications(url: string, data: FormData) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.editClassificationsRequest());
        fetch(url, {
          method: "POST",
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200) {
            dispatch(this.editClassificationsSuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.editClassificationsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to edit classifications",
                url: url
              };
              dispatch(this.editClassificationsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.editClassificationsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  editClassificationsRequest() {
    return { type: this.EDIT_CLASSIFICATIONS_REQUEST };
  }

  editClassificationsSuccess() {
    return { type: this.EDIT_CLASSIFICATIONS_SUCCESS };
  }

  editClassificationsFailure(error?: RequestError) {
    return { type: this.EDIT_CLASSIFICATIONS_FAILURE, error };
  }

  fetchClassifications(url: string) {
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchClassificationsRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: { classifications: ClassificationData[] }) => {
              dispatch(this.fetchClassificationsSuccess());
              dispatch(this.loadClassifications(data.classifications));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchClassificationsFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchClassificationsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve classifications",
                url: url
              };
              dispatch(this.fetchClassificationsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchClassificationsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchClassificationsRequest(url: string) {
    return { type: this.FETCH_CLASSIFICATIONS_REQUEST, url };
  }

  fetchClassificationsSuccess() {
    return { type: this.FETCH_CLASSIFICATIONS_SUCCESS };
  }

  fetchClassificationsFailure(error?: RequestError) {
    return { type: this.FETCH_CLASSIFICATIONS_FAILURE, error };
  }

  loadClassifications(classifications) {
    return { type: this.LOAD_CLASSIFICATIONS, classifications };
  }

  fetchCirculationEvents() {
    let url = "/admin/circulation_events";
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchCirculationEventsRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: { circulation_events: CirculationEventData[] }) => {
              dispatch(this.fetchCirculationEventsSuccess());
              dispatch(this.loadCirculationEvents(data.circulation_events));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchCirculationEventsFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchCirculationEventsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve circulation events",
                url: url
              };
              dispatch(this.fetchCirculationEventsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchCirculationEventsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchCirculationEventsRequest(url: string) {
    return { type: this.FETCH_CIRCULATION_EVENTS_REQUEST, url };
  }

  fetchCirculationEventsSuccess() {
    return { type: this.FETCH_CIRCULATION_EVENTS_SUCCESS };
  }

  fetchCirculationEventsFailure(error?: RequestError) {
    return { type: this.FETCH_CIRCULATION_EVENTS_FAILURE, error };
  }

  loadCirculationEvents(data: CirculationEventData[]) {
    return { type: this.LOAD_CIRCULATION_EVENTS, data };
  }

  fetchStats() {
    let url = "/admin/stats";
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchStatsRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: StatsData) => {
              dispatch(this.fetchStatsSuccess());
              dispatch(this.loadStats(data));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchStatsFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchStatsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve stats",
                url: url
              };
              dispatch(this.fetchStatsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchStatsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchStatsRequest(url: string) {
    return { type: this.FETCH_STATS_REQUEST, url };
  }

  fetchStatsSuccess() {
    return { type: this.FETCH_STATS_SUCCESS };
  }

  fetchStatsFailure(error?: RequestError) {
    return { type: this.FETCH_STATS_FAILURE, error };
  }

  loadStats(data: StatsData) {
    return { type: this.LOAD_STATS, data };
  }

  fetchLibraries() {
    let url = "/admin/libraries";
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchLibrariesRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: LibrariesData) => {
              dispatch(this.fetchLibrariesSuccess());
              dispatch(this.loadLibraries(data));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchLibrariesFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchLibrariesFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve libraries",
                url: url
              };
              dispatch(this.fetchLibrariesFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchLibrariesFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchLibrariesRequest(url: string) {
    return { type: this.FETCH_LIBRARIES_REQUEST, url };
  }

  fetchLibrariesSuccess() {
    return { type: this.FETCH_LIBRARIES_SUCCESS };
  }

  fetchLibrariesFailure(error?: RequestError) {
    return { type: this.FETCH_LIBRARIES_FAILURE, error };
  }

  loadLibraries(data: LibrariesData) {
    return { type: this.LOAD_LIBRARIES, data };
  }

  editLibrary(data: FormData) {
    let err: RequestError;
    const url = "/admin/libraries";

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.editLibraryRequest());
        fetch(url, {
          method: "POST",
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200 || response.status === 201) {
            dispatch(this.editLibrarySuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.editLibraryFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to edit library",
                url: url
              };
              dispatch(this.editLibraryFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.editLibraryFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  editLibraryRequest() {
    return { type: this.EDIT_LIBRARY_REQUEST };
  }

  editLibrarySuccess() {
    return { type: this.EDIT_LIBRARY_SUCCESS };
  }

  editLibraryFailure(error?: RequestError) {
    return { type: this.EDIT_LIBRARY_FAILURE, error };
  }

  fetchCollections() {
    let url = "/admin/collections";
    let err: RequestError;

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.fetchCollectionsRequest(url));
        fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then((data: CollectionsData) => {
              dispatch(this.fetchCollectionsSuccess());
              dispatch(this.loadCollections(data));
              resolve(data);
            }).catch(err => {
              dispatch(this.fetchCollectionsFailure(err));
              reject(err);
            });
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.fetchCollectionsFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to retrieve collections",
                url: url
              };
              dispatch(this.fetchCollectionsFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.fetchCollectionsFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  fetchCollectionsRequest(url: string) {
    return { type: this.FETCH_COLLECTIONS_REQUEST, url };
  }

  fetchCollectionsSuccess() {
    return { type: this.FETCH_COLLECTIONS_SUCCESS };
  }

  fetchCollectionsFailure(error?: RequestError) {
    return { type: this.FETCH_COLLECTIONS_FAILURE, error };
  }

  loadCollections(data: CollectionsData) {
    return { type: this.LOAD_COLLECTIONS, data };
  }

  editCollection(data: FormData) {
    let err: RequestError;
    const url = "/admin/collections";

    return (dispatch => {
      return new Promise((resolve, reject: RequestRejector) => {
        dispatch(this.editCollectionRequest());
        fetch(url, {
          method: "POST",
          body: data,
          credentials: "same-origin"
        }).then(response => {
          if (response.status === 200 || response.status === 201) {
            dispatch(this.editCollectionSuccess());
            resolve(response);
          } else {
            response.json().then(data => {
              err = {
                status: response.status,
                response: data.detail,
                url: url
              };
              dispatch(this.editCollectionFailure(err));
              reject(err);
            }).catch(parseError => {
              err = {
                status: response.status,
                response: "Failed to edit collection",
                url: url
              };
              dispatch(this.editCollectionFailure(err));
              reject(err);
            });
          }
        }).catch(err => {
          err = {
            status: null,
            response: err.message,
            url: url
          };
          dispatch(this.editCollectionFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  editCollectionRequest() {
    return { type: this.EDIT_COLLECTION_REQUEST };
  }

  editCollectionSuccess() {
    return { type: this.EDIT_COLLECTION_SUCCESS };
  }

  editCollectionFailure(error?: RequestError) {
    return { type: this.EDIT_COLLECTION_FAILURE, error };
  }
}