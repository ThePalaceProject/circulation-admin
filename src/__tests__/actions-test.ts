jest.dontMock("../actions");

import ActionCreator from "../actions";

class MockDataFetcher {
  resolve: boolean = true;
  testData: any = "test";

  fetchOPDSData(url) {
    return new Promise((resolve, reject) => {
      if (this.resolve) {
        resolve(this.testData);
      } else {
        reject("test error");
      }
    });
  }

  fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.resolve) {
        resolve(this.testData);
      } else {
        reject("test error");
      }
    });
  }
};

const fetcher = new MockDataFetcher() as any;
const actions = new ActionCreator(fetcher);

describe("actions", () => {
  describe("fetchBook", () => {
    let bookUrl = "http://example.com/book";

    it("dispatches request, load, and success", (done) => {
      let dispatch = jest.genMockFunction();
      let bookData = {
        title: "test title"
      };
      fetcher.testData = bookData;
      fetcher.resolve = true;

      actions.fetchBook(bookUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_BOOK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_BOOK_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_BOOK);
        expect(data).toBe(bookData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure", (done) => {
      let dispatch = jest.genMockFunction();
      fetcher.resolve = false;

      actions.fetchBook(bookUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_BOOK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_BOOK_FAILURE);
        expect(err).toBe("test error");
        done();
      });
    });
  });

  describe("fetchComplaints", () => {
    let complaintsUrl = "http://example.com/complaints";

    it("dispatches request, load, and success", (done) => {
      let dispatch = jest.genMockFunction();
      let complaintsData = {
        book: { id: "test id" },
        complaints: { "test-type": 1 }
      };
      let testData = {
        status: 200,
        json: () => new Promise((resolve, reject) => {
          resolve(complaintsData);
        })
      };
      fetcher.testData = testData;
      fetcher.resolve = true;

      actions.fetchComplaints(complaintsUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_COMPLAINTS);
        expect(data).toBe(complaintsData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches error response", (done) => {
      let dispatch = jest.genMockFunction();
      let testData = {
        status: 401,
        data: "test error"
      };
      fetcher.testData = testData;
      fetcher.resolve = true;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).toEqual({
          status: testData.status,
          response: testData,
          url: complaintsUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches fetch failure", (done) => {
      let dispatch = jest.genMockFunction();
      fetcher.resolve = false;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).toBe("test error");
        done();
      });
    });
  });
});