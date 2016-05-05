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
        reject({
          status: null,
          response: "test error",
          url: url
        });
      }
    });
  }

  fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.resolve) {
        resolve(this.testData);
      } else {
        reject({
          message: "test error"
        });
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
        expect(err).toEqual({
          status: null,
          response: "test error",
          url: bookUrl
        });
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
        reject({ message: "test error" });
      }));
      fetch = fetchMock;

      actions.editBook(editBookUrl, new FormData())(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.EDIT_BOOK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.EDIT_BOOK_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: null,
          response: "test error",
          url: editBookUrl
        });
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
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(complaintsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_COMPLAINTS);
        expect(data).toBe(complaintsData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches server failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: complaintsUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches network failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).toEqual({
          status: null,
          response: "network error",
          url: complaintsUrl
        });
        done();
      });
    });
  });

  describe("postComplaint", () => {
    let postComplaintUrl = "http://example.com/postComplaint"

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
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: postComplaintUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on network failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: null,
          response: "test error",
          url: postComplaintUrl
        });
        done();
      }).catch(err => done.fail(err));
    });
  });

  describe("resolveComplaints", () => {
    let resolveComplaintsUrl = "http://example.com/resolveComplaints"
    let dispatch;
    let formData = new FormData();
    formData.append("csrf_token", "token");
    formData.append("type", "test type");

    beforeEach(() => {
      dispatch = jest.genMockFunction();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).then(response => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.RESOLVE_COMPLAINTS_SUCCESS);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0]).toBe(resolveComplaintsUrl);
        expect(fetchMock.mock.calls[0][1].method).toBe("POST");
        expect(fetchMock.mock.calls[0][1].body).toBe(formData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.RESOLVE_COMPLAINTS_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: resolveComplaintsUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.RESOLVE_COMPLAINTS_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: null,
          response: "test error",
          url: resolveComplaintsUrl
        });
        done();
      }).catch(err => done.fail(err));
    });
  });

  describe("fetchGenres", () => {
    let genresUrl = "http://example.com/genres";

    it("dispatches request, load, and success", (done) => {
      let dispatch = jest.genMockFunction();
      let genresData = {
        book: { id: "test id" },
        genres: { "test-type": 1 }
      };
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(genresData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchGenres(genresUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_GENRES_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_GENRES);
        expect(data).toBe(genresData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches server failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchGenres(genresUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_GENRES_FAILURE);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: genresUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches network failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchGenres(genresUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_GENRES_FAILURE);
        expect(err).toEqual({
          status: null,
          response: "network error",
          url: genresUrl
        });
        done();
      });
    });
  });

  describe("updateGenres", () => {
    let updateGenresUrl = "http://example.com/updateGenres"
    let dispatch;
    let formData = new FormData();
    let newGenres = ["Drama", "Epic Fantasy", "Women Detectives"];
    formData.append("csrf_token", "token");
    newGenres.forEach(genre => formData.append("genres", genre));

    beforeEach(() => {
      dispatch = jest.genMockFunction();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      actions.updateGenres(updateGenresUrl, formData)(dispatch).then(response => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.UPDATE_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.UPDATE_GENRES_SUCCESS);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0]).toBe(updateGenresUrl);
        expect(fetchMock.mock.calls[0][1].method).toBe("POST");
        expect(fetchMock.mock.calls[0][1].body).toBe(formData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((update, reject) => {
        update({
          status: 500,
          json: () => new Promise<any>((update, reject) => {
            update({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.updateGenres(updateGenresUrl, formData)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.UPDATE_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.UPDATE_GENRES_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: updateGenresUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((update, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.updateGenres(updateGenresUrl, formData)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.UPDATE_GENRES_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.UPDATE_GENRES_FAILURE);
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(err).toEqual({
          status: null,
          response: "test error",
          url: updateGenresUrl
        });
        done();
      }).catch(err => done.fail(err));
    });
  });

  describe("fetchClassifications", () => {
    let classificationsUrl = "http://example.com/classifications";

    it("dispatches request, load, and success", (done) => {
      let dispatch = jest.genMockFunction();
      let classificationsData = {
        book: { id: "test id" },
        classifications: { "test-type": 1 }
      };
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(classificationsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).then(data => {
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_CLASSIFICATIONS_SUCCESS);
        expect(dispatch.mock.calls[2][0].type).toBe(actions.LOAD_CLASSIFICATIONS);
        expect(data).toBe(classificationsData);
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches server failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_CLASSIFICATIONS_FAILURE);
        expect(err).toEqual({
          status: 500,
          response: "test error detail",
          url: classificationsUrl
        });
        done();
      }).catch(err => done.fail(err));
    });

    it("dispatches network failure", (done) => {
      let dispatch = jest.genMockFunction();
      let fetchMock = jest.genMockFunction();
      fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).catch(err => {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(actions.FETCH_CLASSIFICATIONS_FAILURE);
        expect(err).toEqual({
          status: null,
          response: "network error",
          url: classificationsUrl
        });
        done();
      });
    });
  });
});