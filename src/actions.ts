import DataFetcher from "opds-browser/lib/DataFetcher";

export default class ActionCreator {
  private fetcher: DataFetcher;

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
        this.fetcher.fetchOPDSData(url).then((data: any) => {
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

  fetchBookRequest(url: string) {
    return { type: this.FETCH_BOOK_REQUEST, url };
  }

  fetchBookSuccess() {
    return { type: this.FETCH_BOOK_SUCCESS };
  }

  fetchBookFailure(message?: string) {
    return { type: this.FETCH_BOOK_FAILURE, message };
  }

  loadBook(data: any, url: string) {
    return { type: this.LOAD_BOOK, data, url };
  }

}