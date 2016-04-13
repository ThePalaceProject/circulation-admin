import { BookData, ComplaintsData } from "./interfaces";
import DataFetcher from "opds-browser/lib/DataFetcher";
import { RequestError, RequestRejector } from "opds-browser/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

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


  constructor(fetcher?: DataFetcher) {
    this.fetcher = fetcher || new DataFetcher();
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
}