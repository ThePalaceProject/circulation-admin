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
const actions = new ActionCreator(fetcher, "token");

describe("actions", () => {
  describe("postForm", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const formData = new (window as any).FormData();
    formData.append("test", "test");

    it("dispatches request, success, and load", async () => {
      const dispatch = stub();
      const responseText = stub().returns(new Promise<string>((resolve) => {
        resolve("response");
      }));
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200, text: responseText });
      }));
      fetch = fetchMock;

      await actions.postForm(type, url, formData)(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${type}_${ActionCreator.LOAD}`);
      expect(dispatch.args[2][0].data).to.equal("response");
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(url);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchMock.args[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });

    it("postForm with JSON response dispatches request, success, and load", async () => {
      const dispatch = stub();
      const textResponse = "{\"id\": \"test\", \"name\": \"test\"}";
      const responseText = stub().returns(new Promise<any>((resolve) => {
        resolve(textResponse);
      }));
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200, text: responseText });
      }));
      fetch = fetchMock;

      await actions.postForm(type, url, formData, "POST", "", "JSON")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${type}_${ActionCreator.LOAD}`);
      expect(dispatch.args[2][0].data).to.equal(textResponse);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(url);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchMock.args[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });

    it("dispatches a DELETE request", async () => {
      const dispatch = stub();
      const responseText = stub().returns(new Promise<string>((resolve) => {
        resolve("response");
      }));
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200, text: responseText });
      }));
      fetch = fetchMock;

      await actions.postForm(type, url, formData, "DELETE")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(url);
      expect(fetchMock.args[0][1].method).to.equal("DELETE");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchMock.args[0][1].headers).to.deep.equal(expectedHeaders);
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

    it("dispatches failure on non-JSON response", async () => {
      const dispatch = stub();
      const nonJsonResponse = new Promise(() => { throw "Not JSON"; });
      const fetchMock = stub().returns(new Promise<any>(resolve => {
        resolve({ status: 500, json: () => nonJsonResponse });
      }));
      fetch = fetchMock;

      try {
        await actions.postForm(type, url, formData, "POST", "Default error")(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(`${type}_${ActionCreator.REQUEST}`);
        expect(dispatch.args[1][0].type).to.equal(`${type}_${ActionCreator.FAILURE}`);
        expect(fetchMock.callCount).to.equal(1);
        expect(err).to.deep.equal({
          status: 500,
          response: "Default error",
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
      const expectedHeaders = new Headers();
      expectedHeaders.append("Accept", "application/json");
      expectedHeaders.append("Content-Type", "application/json");
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchMock.args[0][1].headers).to.deep.equal(expectedHeaders);
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
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.LIBRARIES}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.LIBRARIES}_${ActionCreator.LOAD}`);
      expect(data).to.deep.equal(librariesData);
    });
  });

  describe("editLibrary", () => {
    it("dispatches request and success", async () => {
      const editLibraryUrl = "/admin/libraries";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editLibrary(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.EDIT_LIBRARY}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.EDIT_LIBRARY}_${ActionCreator.SUCCESS}`);
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
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.COLLECTIONS}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.COLLECTIONS}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.COLLECTIONS}_${ActionCreator.LOAD}`);
      expect(data).to.deep.equal(collectionsData);
    });
  });

  describe("editCollection", () => {
    it("dispatches request and success", async () => {
      const editCollectionUrl = "/admin/collections";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editCollection(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.EDIT_COLLECTION}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.EDIT_COLLECTION}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editCollectionUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchAdminAuthServices", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const adminAuthServicesData = "adminAuthServices";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(adminAuthServicesData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchAdminAuthServices()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.ADMIN_AUTH_SERVICES}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.ADMIN_AUTH_SERVICES}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.ADMIN_AUTH_SERVICES}_${ActionCreator.LOAD}`);
      expect(data).to.deep.equal(adminAuthServicesData);
    });
  });

  describe("editAdminAuthService", () => {
    it("dispatches request and success", async () => {
      const editAdminAuthServiceUrl = "/admin/admin_auth_services";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editAdminAuthService(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.EDIT_ADMIN_AUTH_SERVICE}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.EDIT_ADMIN_AUTH_SERVICE}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editAdminAuthServiceUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("fetchIndividualAdmins", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const individualAdminsData = "individualAdmins";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(individualAdminsData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.fetchIndividualAdmins()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.LOAD}`);
      expect(data).to.deep.equal(individualAdminsData);
    });
  });

  describe("editIndividualAdmin", () => {
    it("dispatches request and success", async () => {
      const editIndividualAdminUrl = "/admin/individual_admins";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("email", "email");

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.editIndividualAdmin(formData)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(editIndividualAdminUrl);
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
    });
  });

  describe("getSelfTests", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const collectionSelfTestURL = "/admin/collection_self_tests";
      const selfTestData = "selfTestData";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () => new Promise<any>((resolve, reject) => {
          resolve(selfTestData);
        })
      };
      fetcher.resolve = true;

      const data = await actions.getSelfTests(`${collectionSelfTestURL}/1`)(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`);
      expect(data).to.deep.equal(selfTestData);
    });
  });

  describe("runSelfTests", () => {
    it("dispatches request and success", async () => {
      const collectionSelfTestURL = "/admin/collection_self_tests";
      const dispatch = stub();

      const fetchMock = stub().returns(new Promise<any>((update, reject) => {
        update({ status: 200 });
      }));
      fetch = fetchMock;

      await actions.runSelfTests(`${collectionSelfTestURL}/1`)(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal(`${collectionSelfTestURL}/1`);
      expect(fetchMock.args[0][1].method).to.equal("POST");
    });
  });

  describe("patronLookup", () => {
    it("dispatches request and success", async () => {
      const formData = new (window as any).FormData();
      formData.append("test", "test");
      const dispatch = stub();
      const response = { "id": "test", "name": "test" };
      const responseText = stub().returns(new Promise<any>((resolve) => {
        resolve(response);
      }));
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({
          status: 200,
          json: responseText,
        });
      }));
      fetch = fetchMock;

      const data = await actions.patronLookup(formData, "nypl")(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.PATRON_LOOKUP}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.PATRON_LOOKUP}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.PATRON_LOOKUP}_${ActionCreator.LOAD}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal("/nypl/admin/manage_patrons");
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
      expect(data.json).to.eql(responseText);
    });
  });

  describe("resetAdobeId", () => {
    it("dispatches request and success", async () => {
      const formData = new (window as any).FormData();
      const dispatch = stub();
      const fetchMock = stub().returns(new Promise<any>((resolve, reject) => {
        resolve({ status: 200 });
      }));
      fetch = fetchMock;
      const data = await actions.resetAdobeId(formData, "nypl")(dispatch);
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.SUCCESS}`);
      expect(fetchMock.callCount).to.equal(1);
      expect(fetchMock.args[0][0]).to.equal("/nypl/admin/manage_patrons/reset_adobe_id");
      expect(fetchMock.args[0][1].method).to.equal("POST");
      expect(fetchMock.args[0][1].body).to.equal(formData);
      expect(data.status).to.equal(200);
    });
  });

  describe("clearPatronData", () => {
    it("dispatches load", () => {
      const dispatch = stub();

      actions.clearPatronData()(dispatch);

      expect(dispatch.callCount).to.equal(1);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.CLEAR_PATRON_DATA}_${ActionCreator.LOAD}`);
      expect(dispatch.args[0][0].data).to.equal(null);
    });
  });

  describe("fetchMoreCustomListEntries", () => {
    it("dispatches request and load", async () => {
      const dispatch = stub();
      const customListDetailsData = {
        title: "custom list"
      };
      fetcher.testData = customListDetailsData;
      fetcher.resolve = true;

      const data = await actions.fetchMoreCustomListEntries("url")(dispatch);

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`);
      expect(dispatch.args[1][0].type).to.equal(`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.SUCCESS}`);
      expect(dispatch.args[2][0].type).to.equal(`${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`);
      expect(data).to.eql(customListDetailsData);
    });
  });
});
