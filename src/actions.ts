import DataFetcher from "opds-browser/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

  EDIT_BOOK_REQUEST = "EDIT_BOOK_REQUEST";
  EDIT_BOOK_FAILURE = "EDIT_BOOK_FAILURE";
  FETCH_BOOK_REQUEST = "FETCH_BOOK_REQUEST";
  FETCH_BOOK_SUCCESS = "FETCH_BOOK_SUCCESS";
  FETCH_BOOK_FAILURE = "FETCH_BOOK_FAILURE";
  LOAD_BOOK = "LOAD_BOOK";

  FETCH_COMPLAINTS_REQUEST = "FETCH_COMPLAINTS_REQUEST";
  FETCH_COMPLAINTS_SUCCESS = "FETCH_COMPLAINTS_SUCCESS";
  FETCH_COMPLAINTS_FAILURE = "FETCH_COMPLAINTS_FAILURE";
  LOAD_COMPLAINTS = "LOAD_COMPLAINTS";

  constructor(fetcher: DataFetcher) {
    this.fetcher = fetcher;
  }

  fetchBook(url: string) {
    return (dispatch => {
      return new Promise((resolve, reject) => {
        dispatch(this.fetchBookRequest(url));
        this.fetcher.fetchOPDSData(url).then((data: BookData) => {
          dispatch(this.fetchBookSuccess());
          dispatch(this.loadBook(data, url));
          resolve(data);
        }).catch(err => {
          dispatch(this.fetchBookFailure(err));
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

  fetchBookRequest(url: string) {
    return { type: this.FETCH_BOOK_REQUEST, url };
  }

  fetchBookSuccess() {
    return { type: this.FETCH_BOOK_SUCCESS };
  }

  fetchBookFailure(error?: any) {
    return { type: this.FETCH_BOOK_FAILURE, error };
  }

  loadBook(data: BookData, url: string) {
    return { type: this.LOAD_BOOK, data, url };
  }

  fetchComplaints(url: string) {
    return (dispatch => {
      return new Promise((resolve, reject) => {
        dispatch(this.fetchComplaintsRequest(url));
        this.fetcher.fetch(url, { credentials: "same-origin" }).then(response => {
          if (response.status === 200) {
            response.json().then(data => {
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
    return { type: this.FETCH_BOOK_FAILURE, error };
  }

  loadComplaints(data) {
    return { type: this.LOAD_COMPLAINTS, data };
  }
}