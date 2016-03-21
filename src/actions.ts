import DataFetcher from "opds-browser/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

  EDIT_BOOK_REQUEST = "EDIT_BOOK_REQUEST";
  EDIT_BOOK_FAILURE = "EDIT_BOOK_FAILURE";
  FETCH_BOOK_REQUEST = "FETCH_BOOK_REQUEST";
  FETCH_BOOK_SUCCESS = "FETCH_BOOK_SUCCESS";
  FETCH_BOOK_FAILURE = "FETCH_BOOK_FAILURE";
  LOAD_BOOK = "LOAD_BOOK";

  constructor(fetcher: DataFetcher) {
    this.fetcher = fetcher;
  }

  fetchBook(url: string) {
    return (function(dispatch) {
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

}