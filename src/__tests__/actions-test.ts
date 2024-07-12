import { expect } from "chai";
import { stub } from "sinon";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetchMock = require("fetch-mock");

import ActionCreator from "../actions";
import { getBookData } from "../features/book/bookEditorSlice";

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
          url: url,
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
          message: "test error",
        });
      }
    });
  }
}

const fetcher = new MockDataFetcher() as any;
const actions = new ActionCreator(fetcher, "token");

describe("actions", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe("postForm", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const formData = new (window as any).FormData();
    formData.append("test", "test");

    it("dispatches request, success, and load", async () => {
      const dispatch = stub();
      const responseText = "response";
      fetchMock.post(url, responseText);

      await actions.postForm(type, url, formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${type}_${ActionCreator.LOAD}`
      );
      expect(dispatch.args[2][0].data).to.equal(responseText);
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(url);
      expect(fetchArgs[0][1].method).to.equal("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchArgs[0][1].body).to.equal(formData);
    });

    it("postForm with JSON response dispatches request, success, and load", async () => {
      const dispatch = stub();
      // prettier-ignore
      const responseText = "{\"id\": \"test\", \"name\": \"test\"}";
      fetchMock.mock(url, responseText);

      await actions.postForm(type, url, formData, "POST", "", "JSON")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${type}_${ActionCreator.LOAD}`
      );
      expect(dispatch.args[2][0].data).to.deep.equal(JSON.parse(responseText));
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(url);
      expect(fetchArgs[0][1].method).to.equal("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchArgs[0][1].body).to.equal(formData);
    });

    it("dispatches a DELETE request", async () => {
      const dispatch = stub();
      const responseText = "response";
      fetchMock.mock(url, responseText);

      await actions.postForm(type, url, formData, "DELETE")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(url);
      expect(fetchArgs[0][1].method).to.equal("DELETE");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchArgs[0][1].body).to.equal(formData);
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = stub();
      fetchMock.mock(url, { status: 500, body: { detail: "problem detail" } });

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.args[1][0].type).to.equal(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(fetchMock.called()).to.equal(true);
        expect(err).to.deep.equal({
          status: 500,
          response: "problem detail",
          url: url,
        });
      }
    });

    it("dispatches failure on non-JSON response", async () => {
      const dispatch = stub();
      fetchMock.mock(url, { status: 500, body: "Not JSON" });

      try {
        await actions.postForm(
          type,
          url,
          formData,
          "POST",
          "Default error"
        )(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.args[1][0].type).to.equal(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(fetchMock.called()).to.equal(true);
        expect(err).to.deep.equal({
          status: 500,
          response: "Default error",
          url: url,
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = stub();
      fetchMock.mock(url, () => {
        throw { message: "test error" };
      });

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.args[1][0].type).to.equal(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(fetchMock.called()).to.equal(true);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: url,
        });
      }
    });
  });

  describe("postJSON", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const jsonData = { test: 1 };

    it("dispatches request and success", async () => {
      const dispatch = stub();
      fetchMock.mock(url, 200);

      await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(url);
      expect(fetchArgs[0][1].method).to.equal("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("Accept", "application/json");
      expectedHeaders.append("Content-Type", "application/json");
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).to.deep.equal(expectedHeaders);
      expect(fetchArgs[0][1].body).to.equal(JSON.stringify(jsonData));
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = stub();
      fetchMock.mock(url, { status: 500, body: { detail: "problem detail" } });

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.args[1][0].type).to.equal(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(fetchMock.called()).to.equal(true);
        expect(err).to.deep.equal({
          status: 500,
          response: "problem detail",
          url: url,
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = stub();
      fetchMock.mock(url, () => {
        throw { message: "test error" };
      });

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).to.equal(true);
      } catch (err) {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.args[1][0].type).to.equal(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(fetchMock.called()).to.equal(true);
        expect(err).to.deep.equal({
          status: null,
          response: "test error",
          url: url,
        });
      }
    });
  });

  describe("fetchComplaints", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const complaintsData = {
        book: { id: "test id" },
        complaints: { "test-type": 1 },
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(complaintsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchComplaints(
        "http://example.com/complaints"
      )(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.COMPLAINTS_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.COMPLAINTS_SUCCESS
      );
      expect(dispatch.args[2][0].type).to.equal(ActionCreator.COMPLAINTS_LOAD);
      expect(data).to.deep.equal(complaintsData);
    });
  });

  describe("postComplaint", () => {
    it("dispatches request and success", async () => {
      const postComplaintUrl = "http://example.com/postComplaint";
      const dispatch = stub();
      const data = {
        type: "test type",
      };

      fetchMock.mock(postComplaintUrl, 201);

      await actions.postComplaint(postComplaintUrl, data)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.POST_COMPLAINT_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.POST_COMPLAINT_SUCCESS
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(postComplaintUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(JSON.stringify(data));
    });
  });

  describe("resolveComplaints", () => {
    it("dispatches request and success", async () => {
      const resolveComplaintsUrl = "http://example.com/resolveComplaints";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("type", "test type");

      fetchMock.mock(resolveComplaintsUrl, "server response");

      await actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.RESOLVE_COMPLAINTS_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.RESOLVE_COMPLAINTS_SUCCESS
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(resolveComplaintsUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("fetchGenreTree", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const genresData = "test data";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(genresData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchGenreTree("http://example.com/genres")(
        dispatch
      );
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.GENRE_TREE_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.GENRE_TREE_SUCCESS
      );
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
      newGenreTree.forEach((genre) => formData.append("genres", genre));

      fetchMock.mock(editClassificationsUrl, "server response");

      await actions.editClassifications(
        editClassificationsUrl,
        formData
      )(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.EDIT_CLASSIFICATIONS_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.EDIT_CLASSIFICATIONS_SUCCESS
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(editClassificationsUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("fetchClassifications", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const classificationsData = {
        book: { id: "test id" },
        classifications: { "test-type": 1 },
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(classificationsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchClassifications(
        "http://example.com/classifications"
      )(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.CLASSIFICATIONS_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.CLASSIFICATIONS_SUCCESS
      );
      expect(dispatch.args[2][0].type).to.equal(
        ActionCreator.CLASSIFICATIONS_LOAD
      );
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
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(eventsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchCirculationEvents()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        ActionCreator.CIRCULATION_EVENTS_REQUEST
      );
      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.CIRCULATION_EVENTS_SUCCESS
      );
      expect(dispatch.args[2][0].type).to.equal(
        ActionCreator.CIRCULATION_EVENTS_LOAD
      );
      expect(data).to.deep.equal(eventsData);
    });
  });

  describe("fetchDiagnostics", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const diagnosticsData = "diagnostics";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(diagnosticsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchDiagnostics()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[0][0].url).to.equal("/admin/diagnostics");
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(diagnosticsData);
    });
  });

  describe("fetchLibraries", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const librariesData = "libraries";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(librariesData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchLibraries()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.LIBRARIES}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.LIBRARIES}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(librariesData);
    });
  });

  describe("editLibrary", () => {
    it("dispatches request and success", async () => {
      const editLibraryUrl = "/admin/libraries";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      fetchMock.mock(editLibraryUrl, "server response");

      await actions.editLibrary(formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(editLibraryUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("fetchCollections", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const collectionsData = "collections";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(collectionsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchCollections()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(collectionsData);
    });
  });

  describe("editCollection", () => {
    it("dispatches request and success", async () => {
      const editCollectionUrl = "/admin/collections";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      fetchMock.mock(editCollectionUrl, "server response");

      await actions.editCollection(formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.EDIT_COLLECTION}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.EDIT_COLLECTION}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(editCollectionUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("fetchIndividualAdmins", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const individualAdminsData = "individualAdmins";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(individualAdminsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchIndividualAdmins()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(individualAdminsData);
    });
  });

  describe("editIndividualAdmin", () => {
    it("dispatches request and success", async () => {
      const editIndividualAdminUrl = "/admin/individual_admins";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("email", "email");

      fetchMock.mock(editIndividualAdminUrl, "server response");

      await actions.editIndividualAdmin(formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(editIndividualAdminUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
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
        json: () =>
          new Promise<any>((resolve, reject) => {
            resolve(selfTestData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.getSelfTests(`${collectionSelfTestURL}/1`)(
        dispatch
      );
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(selfTestData);
    });
  });

  describe("runSelfTests", () => {
    it("dispatches request and success", async () => {
      const collectionUrl = "/admin/collection_self_tests/";
      const collectionSelfTestURL = `${collectionUrl}/1`;
      const dispatch = stub();

      fetchMock.mock(collectionSelfTestURL, "server response");

      await actions.runSelfTests(collectionSelfTestURL)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(collectionSelfTestURL);
      expect(fetchArgs[0][1].method).to.equal("POST");
    });
  });

  describe("patronLookup", () => {
    it("dispatches request, success, and load", async () => {
      const formData = new (window as any).FormData();
      formData.append("test", "test");
      const dispatch = stub();
      // prettier-ignore
      const response = "{\"id\": \"test\", \"name\": \"test\"}";

      fetchMock.mock("/nypl/admin/manage_patrons", response);

      const data = await actions.patronLookup(formData, "nypl")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.LOAD}`
      );
      expect(dispatch.args[2][0].data).to.deep.equal(JSON.parse(response));
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal("/nypl/admin/manage_patrons");
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("resetAdobeId", () => {
    it("dispatches request and success", async () => {
      const formData = new (window as any).FormData();
      const dispatch = stub();

      fetchMock.mock(
        "/nypl/admin/manage_patrons/reset_adobe_id",
        "server response"
      );

      const data = await actions.resetAdobeId(formData, "nypl")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(
        "/nypl/admin/manage_patrons/reset_adobe_id"
      );
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
      expect(data.status).to.equal(200);
    });
  });

  describe("clearPatronData", () => {
    it("dispatches load", () => {
      const dispatch = stub();

      actions.clearPatronData()(dispatch);

      expect(dispatch.callCount).to.equal(1);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.CLEAR_PATRON_DATA}_${ActionCreator.LOAD}`
      );
      expect(dispatch.args[0][0].data).to.equal(null);
    });
  });

  describe("fetchMoreCustomListEntries", () => {
    it("dispatches request and load", async () => {
      const dispatch = stub();

      const getState = stub().returns({
        editor: {
          customListDetails: {
            data: {
              nextPageUrl: "url",
            },
            isFetchingMoreEntries: false,
          },
        },
      });

      const customListDetailsData = {
        title: "custom list",
      };
      fetcher.testData = customListDetailsData;
      fetcher.resolve = true;

      // FIXME: This is a bit of a hack that requires knowing that the implementation of
      // fetchMoreCustomListEntries calls dispatch internally on another action creator.
      // These tests should all be refactored at some point to account for this case.
      const outerDispatch = (action) => action(dispatch);

      const data = await actions.fetchMoreCustomListEntries()(
        outerDispatch,
        getState
      );

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`
      );
      expect(data).to.eql(customListDetailsData);
    });
  });

  describe("fetchSitewideAnnouncements", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = stub();
      const sitewideAnnouncementsData = "sitewide announcements";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve) => {
            resolve(sitewideAnnouncementsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchSitewideAnnouncements()(dispatch);
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[0][0].url).to.equal("/admin/announcements");
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.args[2][0].type).to.equal(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.LOAD}`
      );
      expect(data).to.deep.equal(sitewideAnnouncementsData);
    });
  });

  describe("editSitewideAnnouncements", () => {
    it("dispatches request and success", async () => {
      const editSitewideAnnouncementsUrl = "/admin/announcements";
      const dispatch = stub();
      const formData = new (window as any).FormData();
      formData.append("announcements", "[]");

      fetchMock.mock(editSitewideAnnouncementsUrl, "server response");

      await actions.editSitewideAnnouncements(formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.EDIT_SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.args[1][0].type).to.equal(
        `${ActionCreator.EDIT_SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).to.equal(true);
      expect(fetchArgs[0][0]).to.equal(editSitewideAnnouncementsUrl);
      expect(fetchArgs[0][1].method).to.equal("POST");
      expect(fetchArgs[0][1].body).to.equal(formData);
    });
  });

  describe("openCustomListEditor", () => {
    it("dispatches CUSTOM_LIST_DETAILS_CLEAR and OPEN_CUSTOM_LIST_EDITOR", async () => {
      const dispatch = stub();

      const getState = () => ({
        editor: {
          customLists: {
            data: {
              foo: "bar",
            },
          },
        },
      });

      await actions.openCustomListEditor("list_id")(dispatch, getState);

      expect(dispatch.callCount).to.equal(2);

      expect(dispatch.args[0][0].type).to.equal(
        `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.CLEAR}`
      );

      expect(dispatch.args[1][0].type).to.equal(
        ActionCreator.OPEN_CUSTOM_LIST_EDITOR
      );
      expect(dispatch.args[1][0].id).to.equal("list_id");
      expect(dispatch.args[1][0].data).to.deep.equal(
        getState().editor.customLists.data
      );
    });
  });
});
