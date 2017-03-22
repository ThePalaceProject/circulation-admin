import { expect } from "chai";
import { stub } from "sinon";

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
      let dispatch = stub();
      let bookData = {
        title: "test title"
      };
      fetcher.testData = bookData;
      fetcher.resolve = true;

      actions.fetchBookAdmin(bookUrl)(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_BOOK_ADMIN_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_BOOK_ADMIN_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_BOOK_ADMIN);
        expect(data).to.deep.equal(bookData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure", (done) => {
      let dispatch = stub();
      fetcher.resolve = false;

      actions.fetchBookAdmin(bookUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_BOOK_ADMIN_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_BOOK_ADMIN_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: bookUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("editBook", () => {
    let editBookUrl = "http://example.com/editBook";

    it("dispatches request and success", (done) => {
      let dispatch = stub();
      let formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("title", "title");
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      actions.editBook(editBookUrl, formData)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_BOOK_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_BOOK_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(editBookUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(formData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ message: "test error" });
      }));
      fetch = fetchMock;

      actions.editBook(editBookUrl, new (window as any).FormData())(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_BOOK_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_BOOK_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: editBookUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchComplaints", () => {
    let complaintsUrl = "http://example.com/complaints";

    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let complaintsData = {
        book: { id: "test id" },
        complaints: { "test-type": 1 }
      };
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(complaintsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COMPLAINTS_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_COMPLAINTS);
        expect(data).to.deep.equal(complaintsData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: complaintsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchComplaints(complaintsUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COMPLAINTS_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: complaintsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("postComplaint", () => {
    let postComplaintUrl = "http://example.com/postComplaint";

    it("dispatches request and success", (done) => {
      let dispatch = stub();
      let data = {
        type: "test type"
      };
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 201 });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, data)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(postComplaintUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(JSON.stringify(data));
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: postComplaintUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.postComplaint(postComplaintUrl, { type: "test" })(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: postComplaintUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("resolveComplaints", () => {
    let resolveComplaintsUrl = "http://example.com/resolveComplaints";
    let dispatch;
    let formData = new (window as any).FormData();
    formData.append("csrf_token", "token");
    formData.append("type", "test type");

    beforeEach(() => {
      dispatch = stub();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.RESOLVE_COMPLAINTS_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(resolveComplaintsUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(formData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.RESOLVE_COMPLAINTS_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: resolveComplaintsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.RESOLVE_COMPLAINTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.RESOLVE_COMPLAINTS_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: resolveComplaintsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchGenreTree", () => {
    let genresUrl = "http://example.com/genres";

    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let genresData = "test data";
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(genresData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchGenreTree(genresUrl)(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_GENRE_TREE_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_GENRE_TREE_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_GENRE_TREE);
        expect(data).to.equal(genresData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchGenreTree(genresUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_GENRE_TREE_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_GENRE_TREE_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: genresUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchGenreTree(genresUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_GENRE_TREE_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_GENRE_TREE_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: genresUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("editClassifications", () => {
    let editClassificationsUrl = "http://example.com/editClassifications";
    let dispatch;
    let formData = new (window as any).FormData();
    let newGenreTree = ["Drama", "Epic Fantasy", "Women Detectives"];
    formData.append("csrf_token", "token");
    newGenreTree.forEach(genre => formData.append("genres", genre));

    beforeEach(() => {
      dispatch = stub();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      actions.editClassifications(editClassificationsUrl, formData)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(editClassificationsUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(formData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({
          status: 500,
          json: () => new Promise<any>((update, reject) => {
            update({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.editClassifications(editClassificationsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: editClassificationsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.editClassifications(editClassificationsUrl, formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_CLASSIFICATIONS_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: editClassificationsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchClassifications", () => {
    let classificationsUrl = "http://example.com/classifications";

    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let classificationsData = {
        book: { id: "test id" },
        classifications: { "test-type": 1 }
      };
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(classificationsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_CLASSIFICATIONS);
        expect(data).to.equal(classificationsData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: classificationsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchClassifications(classificationsUrl)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CLASSIFICATIONS_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: classificationsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchCirculationEvents", () => {
    let eventsUrl = "/admin/circulation_events";


    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let eventsData = "circulation events data";
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(eventsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchCirculationEvents()(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_CIRCULATION_EVENTS);
        expect(data).to.deep.equal(eventsData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchCirculationEvents()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: eventsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchCirculationEvents()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_CIRCULATION_EVENTS_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: eventsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchStats", () => {
    let statsUrl = "/admin/stats";


    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let statsData = "stats";
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(statsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchStats()(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_STATS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_STATS_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_STATS);
        expect(data).to.deep.equal(statsData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchStats()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_STATS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_STATS_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: statsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchStats()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_STATS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_STATS_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: statsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchLibraries", () => {
    let librariesUrl = "/admin/libraries";


    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let librariesData = "libraries";
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(librariesData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchLibraries()(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_LIBRARIES_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_LIBRARIES_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_LIBRARIES);
        expect(data).to.deep.equal(librariesData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchLibraries()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_LIBRARIES_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_LIBRARIES_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: librariesUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchLibraries()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_LIBRARIES_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_LIBRARIES_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: librariesUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("editLibrary", () => {
    let editLibraryUrl = "/admin/libraries";
    let dispatch;
    let formData = new (window as any).FormData();
    formData.append("csrf_token", "token");
    formData.append("name", "new name");

    beforeEach(() => {
      dispatch = stub();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      actions.editLibrary(formData)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_LIBRARY_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_LIBRARY_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(editLibraryUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(formData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({
          status: 500,
          json: () => new Promise<any>((update, reject) => {
            update({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.editLibrary(formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_LIBRARY_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_LIBRARY_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: editLibraryUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.editLibrary(formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_LIBRARY_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_LIBRARY_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: editLibraryUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("fetchCollections", () => {
    let collectionsUrl = "/admin/collections";


    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      let collectionsData = "collections";
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: () => new Promise<any>((resolve, reject) => {
            resolve(collectionsData);
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchCollections()(dispatch).then(data => {
        expect(dispatch.callCount).to.equal(3);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COLLECTIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COLLECTIONS_SUCCESS);
        expect(dispatch.args[2][0].type).to.equal(actions.LOAD_COLLECTIONS);
        expect(data).to.deep.equal(collectionsData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches server failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 500,
          json: () => new Promise<any>((resolve, reject) => {
            resolve({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.fetchCollections()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COLLECTIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COLLECTIONS_FAILURE);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: collectionsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches network failure", (done) => {
      let dispatch = stub();
      let fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({
          message: "network error"
        });
      }));
      fetch = fetchMock;

      actions.fetchCollections()(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COLLECTIONS_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COLLECTIONS_FAILURE);
        expect(err).to.deep.equal({
          status: null,
          response: "network error",
          url: collectionsUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });

  describe("editCollection", () => {
    let editCollectionUrl = "/admin/collections";
    let dispatch;
    let formData = new (window as any).FormData();
    formData.append("csrf_token", "token");
    formData.append("name", "new name");

    beforeEach(() => {
      dispatch = stub();
    });

    it("dispatches request and success", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      actions.editCollection(formData)(dispatch).then(response => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_COLLECTION_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_COLLECTION_SUCCESS);
        expect(fetchMock.callCount).to.equal(1);
        expect(fetchMock.args[0][0]).to.equal(editCollectionUrl);
        expect(fetchMock.args[0][1].method).to.equal("POST");
        expect(fetchMock.args[0][1].body).to.equal(formData);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on server failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({
          status: 500,
          json: () => new Promise<any>((update, reject) => {
            update({ status: 500, detail: "test error detail" });
          })
        });
      }));
      fetch = fetchMock;

      actions.editCollection(formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_COLLECTION_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_COLLECTION_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "test error detail",
          url: editCollectionUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure on network failure", (done) => {
      let fetchMock = stub().returns(new Promise<any>((update, reject) => {
        reject({ message : "test error" });
      }));
      fetch = fetchMock;

      actions.editCollection(formData)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.EDIT_COLLECTION_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.EDIT_COLLECTION_FAILURE);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: editCollectionUrl
        });
        done();
      }).catch(err => { console.log(err); throw(err); });
    });
  });
});