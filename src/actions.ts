import DataFetcher from "opds-browser/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

  EDIT_BOOK_REQUEST = "EDIT_BOOK_REQUEST";
  EDIT_BOOK_FAILURE = "EDIT_BOOK_FAILURE";
  FETCH_BOOK_ADMIN_REQUEST = "FETCH_BOOK_ADMIN_REQUEST";
  FETCH_BOOK_ADMIN_SUCCESS = "FETCH_BOOK_ADMIN_SUCCESS";
  FETCH_BOOK_ADMIN_FAILURE = "FETCH_BOOK_ADMIN_FAILURE";
  LOAD_BOOK_ADMIN = "LOAD_BOOK_ADMIN";

  FETCH_COMPLAINTS_REQUEST = "FETCH_COMPLAINTS_REQUEST";
  FETCH_COMPLAINTS_SUCCESS = "FETCH_COMPLAINTS_SUCCESS";
  FETCH_COMPLAINTS_FAILURE = "FETCH_COMPLAINTS_FAILURE";
  LOAD_COMPLAINTS = "LOAD_COMPLAINTS";

  constructor(fetcher: DataFetcher) {
    this.fetcher = fetcher;
  }

  fetchBookAdmin(url: string) {
    return (dispatch => {
      return new Promise((resolve, reject) => {
        dispatch(this.fetchBookAdminRequest(url));
        this.fetcher.fetchOPDSData(url).then((data: BookData) => {
          dispatch(this.fetchBookAdminSuccess());
          dispatch(this.loadBookAdmin(data, url));
          resolve(data);
        }).catch(err => {
          dispatch(this.fetchBookAdminFailure(err));
          reject(err);
        });
      });
    }).bind(this);
  }

  editRequest() {
    return { type: this.EDIT_BOOK_REQUEST };
  }

  editFailure(error?: any) {
    return { type: this.EDIT_BOOK_FAILURE, error };
  }

  fetchBookAdminRequest(url: string) {
    return { type: this.FETCH_BOOK_ADMIN_REQUEST, url };
  }

  fetchBookAdminSuccess() {
    return { type: this.FETCH_BOOK_ADMIN_SUCCESS };
  }

  fetchBookAdminFailure(error?: any) {
    return { type: this.FETCH_BOOK_ADMIN_FAILURE, error };
  }

  loadBookAdmin(data: BookData, url: string) {
    return { type: this.LOAD_BOOK_ADMIN, data, url };
  }

  fetchComplaints(url: string) {
    return (dispatch => {
      return new Promise((resolve, reject) => {
        dispatch(this.fetchComplaintsRequest(url));
        this.fetcher.fetch(url, { credentials: "same-origin" }).then(response => {
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
            let err = {
              status: response.status,
              response: response,
              url: url
            };
            dispatch(this.fetchComplaintsFailure(err));
            reject(err);
          }
        }).catch(err => {
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

  fetchComplaintsFailure(error?: any) {
    return { type: this.FETCH_COMPLAINTS_FAILURE, error };
  }

  loadComplaints(data) {
    return { type: this.LOAD_COMPLAINTS, data };
  }
}