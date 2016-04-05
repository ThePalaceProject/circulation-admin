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
  describe("fetchBookAdmin", () => {
    let bookUrl = "http://example.com/book";

    it("dispatches request, load, and success", (done) => {
      let dispatch = jest.genMockFunction();
      let bookData = {
        title: "test title"
      };
      fetcher.testData = bookData;
      fetcher.resolve = true;

      actions.fetchBookAdmin(bookUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_BOOK_ADMIN_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_BOOK_ADMIN_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_BOOK_ADMIN);
        expect(data).toBe(bookData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure", (done) => {
      let dispatch = jest.genMockFunction();
      fetcher.resolve = false;

      actions.fetchBookAdmin(bookUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_BOOK_ADMIN_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_BOOK_ADMIN_FAILURE);
        expect(err).toBe("test error");
        done();
      });
    });
  });

  describe("editBook", () => {
    let editBookUrl = "http://example.com/editBook";

    it("dispatches request and success", (done) => {
      let dispatch = jest.genMockFunction();
      let formData = new FormData();
      formData.append("csrf_token", "token");
      formData.append("title", "title");
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      actions.editBook(editBookUrl, formData)(dispatch).then(response => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.EDIT_BOOK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.EDIT_BOOK_SUCCESS);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0]).toBe(editBookUrl);
        expect(fetchMock.mock.calls[0][1].method).toBe("POST");
        expect(fetchMock.mock.calls[0][1].body).toBe(formData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject("test error");
      }));
      fetch = fetchMock;

      actions.editBook(editBookUrl, new FormData())(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.EDIT_BOOK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.EDIT_BOOK_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toBe("test error");
        done();
      }).catch(err => done.fail(err));
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

  describe("postComplaint", () => {
    let postComplaintUrl;

    it("dispatches request and success", (done) => {
      let dispatch = jest.genMockFunction();
      let data = {
        type: "test type"
      };
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({ status: 201 });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, data)(dispatch).then(response => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.POST_COMPLAINT_SUCCESS);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0]).toBe(postComplaintUrl);
        expect(fetchMock.mock.calls[0][1].method).toBe("POST");
        expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(data));
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on server failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({ status: 500 });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: 500,
          response: { status: 500 },
          url: postComplaintUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on network failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject("test error");
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toBe("test error");
        done();
      }).catch(err => done.fail(err));
    });
  });
});