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
  describe("postForm", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const formData = new (window as any).FormData();
    formData.append("csrf_token", "token");
    formData.append("test", "test");

    it("dispatches request and success", async () => {
      const dispatch = stub();
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.postForm(type, url, formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(url);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = stub();
      const jsonResponse = new Promise(resolve => resolve({ detail: "problem detail" }));
      const fetchMock = stub().returns(new Promise<any>(resolve => {
        resolve({ status: 500, json: () => jsonResponse });
      }));
      fetch = fetchMock;

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
        expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.FAILURE}`);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "problem detail",
          url: url
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = stub();
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ message: "test error" });
      }));
      fetch = fetchMock;

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
        expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.FAILURE}`);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: url
        });
      }
    });
  });

  describe("postJSON", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const jsonData = { "test": 1 };

    it("dispatches request and success", async () => {
      const dispatch = stub();
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(url);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(JSON.stringify(jsonData));
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = stub();
      const jsonResponse = new Promise(resolve => resolve({ detail: "problem detail" }));
      const fetchMock = stub().returns(new Promise<any>(resolve => {
        resolve({ status: 500, json: () => jsonResponse });
      }));
      fetch = fetchMock;

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
        expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.FAILURE}`);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "problem detail",
          url: url
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = stub();
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ message: "test error" });
      }));
      fetch = fetchMock;

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
        expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.FAILURE}`);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: url
        });
      }
    });
  });

  describe("fetchBookAdmin", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const bookData = {
        title: "test title"
      };
      fetcher.testData = bookData;
      fetcher.resolve = true;

      const data = await actions.fetchBookAdmin("http://example.com/book")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.BOOK_ADMIN_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.BOOK_ADMIN_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.BOOK_ADMIN_LOAD);
      expect(data).to.deep.equal(bookData);
    });
  });

  describe("editBook", () => {
    it("dispatches request and success", async () => {
      const editBookUrl = "http://example.com/editBook";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("title", "title");
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editBook(editBookUrl, formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.EDIT_BOOK_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.EDIT_BOOK_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editBookUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchComplaints", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const complaintsData = {
        book: { id: "test id" },
        complaints: { "test-type": 1 }
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(complaintsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchComplaints("http://example.com/complaints")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.COMPLAINTS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.COMPLAINTS_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.COMPLAINTS_LOAD);
      expect(data).to.deep.equal(complaintsData);
    });
  });

  describe("postComplaint", () => {
    it("dispatches request and success", async () => {
      const postComplaintUrl = "http://example.com/postComplaint";
      const dispatch = stub();
      const data = {
        type: "test type"
      };
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 201 });
      }));
      fetch = fetchMock;

      await actions.postComplaint(postComplaintUrl, data)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.POST_COMPLAINT_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.POST_COMPLAINT_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(postComplaintUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(JSON.stringify(data));
    });
  });

  describe("resolveComplaints", () => {
    it("dispatches request and success", async () => {
      const resolveComplaintsUrl = "http://example.com/resolveComplaints";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("type", "test type");
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.RESOLVE_COMPLAINTS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.RESOLVE_COMPLAINTS_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(resolveComplaintsUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchGenreTree", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const genresData = "test data";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(genresData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchGenreTree("http://example.com/genres")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.GENRE_TREE_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.GENRE_TREE_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.GENRE_TREE_LOAD);
      expect(data).to.equal(genresData);
    });
  });

  describe("editClassifications", () => {
    it("dispatches request and success", async () => {
      const editClassificationsUrl = "http://example.com/editClassifications";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      const newGenreTree = ["Drama", "Epic Fantasy", "Women Detectives"];
      formData.append("csrf_token", "token");
      newGenreTree.forEach(genre => formData.append("genres", genre));

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editClassifications(editClassificationsUrl, formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.EDIT_CLASSIFICATIONS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.EDIT_CLASSIFICATIONS_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editClassificationsUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchClassifications", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const classificationsData = {
        book: { id: "test id" },
        classifications: { "test-type": 1 }
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(classificationsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchClassifications("http://example.com/classifications")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.CLASSIFICATIONS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.CLASSIFICATIONS_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.CLASSIFICATIONS_LOAD);
      expect(data).to.equal(classificationsData);
    });
  });

  describe("fetchCirculationEvents", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const eventsData = "circulation events data";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(eventsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchCirculationEvents()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.CIRCULATION_EVENTS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.CIRCULATION_EVENTS_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.CIRCULATION_EVENTS_LOAD);
      expect(data).to.deep.equal(eventsData);
    });
  });

  describe("fetchStats", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const statsData = "stats";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(statsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchStats()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.STATS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.STATS_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.STATS_LOAD);
      expect(data).to.deep.equal(statsData);
    });
  });

  describe("fetchLibraries", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const librariesData = "libraries";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(librariesData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchLibraries()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.LIBRARIES_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.LIBRARIES_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.LIBRARIES_LOAD);
      expect(data).to.deep.equal(librariesData);
    });
  });

  describe("editLibrary", () => {
    it("dispatches request and success", async () => {
      const editLibraryUrl = "/admin/libraries";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("name", "new name");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editLibrary(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.EDIT_LIBRARY_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.EDIT_LIBRARY_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editLibraryUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchCollections", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const collectionsData = "collections";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(collectionsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchCollections()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.COLLECTIONS_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.COLLECTIONS_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.COLLECTIONS_LOAD);
      expect(data).to.deep.equal(collectionsData);
    });
  });

  describe("editCollection", () => {
    it("dispatches request and success", async () => {
      const editCollectionUrl = "/admin/collections";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("name", "new name");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editCollection(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(ActionCreator.EDIT_COLLECTION_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(ActionCreator.EDIT_COLLECTION_SUCCESS);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editCollectionUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });
});