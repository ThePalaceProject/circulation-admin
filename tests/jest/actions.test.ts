import { http, HttpResponse } from "msw";

import ActionCreator from "../../src/actions";
import { setupMswServer } from "./testUtils/mswServer";

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

  fetch(url, _options = {}) {
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
  // Tests check each header the action sets, not the whole header set, because
  // `fetch` adds headers of its own (such as `Content-Type` for form data).
  const { server, requests } = setupMswServer();

  describe("postForm", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const formData = new (window as any).FormData();
    formData.append("test", "test");

    it("dispatches request, success, and load", async () => {
      const dispatch = jest.fn();
      const responseText = "response";
      server.use(http.post(url, () => HttpResponse.text(responseText)));

      await actions.postForm(type, url, formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${type}_${ActionCreator.LOAD}`
      );
      expect(dispatch.mock.calls[2][0].data).toBe(responseText);
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(url);
      expect(requests[0].method).toBe("POST");
      expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
      expect((await requests[0].formData()).get("test")).toBe("test");
    });

    it("postForm with JSON response dispatches request, success, and load", async () => {
      const dispatch = jest.fn();
      // prettier-ignore
      const responseText = "{\"id\": \"test\", \"name\": \"test\"}";
      server.use(http.post(url, () => HttpResponse.text(responseText)));

      await actions.postForm(type, url, formData, "POST", "", "JSON")(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${type}_${ActionCreator.LOAD}`
      );
      // Node's fetch parses the body into an object from another realm, so
      // toStrictEqual would fail on the prototype.
      expect(dispatch.mock.calls[2][0].data).toEqual(JSON.parse(responseText));
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(url);
      expect(requests[0].method).toBe("POST");
      expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
      expect((await requests[0].formData()).get("test")).toBe("test");
    });

    it("dispatches a DELETE request", async () => {
      const dispatch = jest.fn();
      const responseText = "response";
      server.use(http.delete(url, () => HttpResponse.text(responseText)));

      await actions.postForm(type, url, formData, "DELETE")(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(url);
      expect(requests[0].method).toBe("DELETE");
      expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
      expect((await requests[0].formData()).get("test")).toBe("test");
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = jest.fn();
      server.use(
        http.post(url, () =>
          HttpResponse.json({ detail: "problem detail" }, { status: 500 })
        )
      );

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(requests).toHaveLength(1);
        expect(err).toStrictEqual({
          status: 500,
          response: "problem detail",
          url: url,
        });
      }
    });

    it("dispatches failure on non-JSON response", async () => {
      const dispatch = jest.fn();
      server.use(
        http.post(url, () => HttpResponse.text("Not JSON", { status: 500 }))
      );

      try {
        await actions.postForm(
          type,
          url,
          formData,
          "POST",
          "Default error"
        )(dispatch);
        // shouldn't get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(requests).toHaveLength(1);
        expect(err).toStrictEqual({
          status: 500,
          response: "Default error",
          url: url,
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = jest.fn();
      // fetch rejects a network error with a "Failed to fetch" TypeError.
      server.use(http.post(url, () => HttpResponse.error()));

      try {
        await actions.postForm(type, url, formData)(dispatch);
        // shouldn't get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(requests).toHaveLength(1);
        expect(err).toStrictEqual({
          status: null,
          response: "Failed to fetch",
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
      const dispatch = jest.fn();
      server.use(http.post(url, () => new HttpResponse(null, { status: 200 })));

      await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(url);
      expect(requests[0].method).toBe("POST");
      expect(requests[0].headers.get("Accept")).toBe("application/json");
      expect(requests[0].headers.get("Content-Type")).toBe("application/json");
      expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
      expect(await requests[0].text()).toBe(JSON.stringify(jsonData));
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = jest.fn();
      server.use(
        http.post(url, () =>
          HttpResponse.json({ detail: "problem detail" }, { status: 500 })
        )
      );

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(requests).toHaveLength(1);
        expect(err).toStrictEqual({
          status: 500,
          response: "problem detail",
          url: url,
        });
      }
    });

    it("dispatches failure on no response", async () => {
      const dispatch = jest.fn();
      // fetch rejects a network error with a "Failed to fetch" TypeError.
      server.use(http.post(url, () => HttpResponse.error()));

      try {
        await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
        // shouldn't get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          `${type}_${ActionCreator.REQUEST}`
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          `${type}_${ActionCreator.FAILURE}`
        );
        expect(requests).toHaveLength(1);
        expect(err).toStrictEqual({
          status: null,
          response: "Failed to fetch",
          url: url,
        });
      }
    });
  });

  describe("fetchComplaints", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const complaintsData = {
        book: { id: "test id" },
        complaints: { "test-type": 1 },
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(complaintsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchComplaints(
        "http://example.com/complaints"
      )(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.COMPLAINTS_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.COMPLAINTS_SUCCESS
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        ActionCreator.COMPLAINTS_LOAD
      );
      expect(data).toStrictEqual(complaintsData);
    });
  });

  describe("postComplaint", () => {
    it("dispatches request and success", async () => {
      const postComplaintUrl = "http://example.com/postComplaint";
      const dispatch = jest.fn();
      const data = {
        type: "test type",
      };

      server.use(
        http.post(
          postComplaintUrl,
          () => new HttpResponse(null, { status: 201 })
        )
      );

      await actions.postComplaint(postComplaintUrl, data)(dispatch);

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.POST_COMPLAINT_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.POST_COMPLAINT_SUCCESS
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(postComplaintUrl);
      expect(requests[0].method).toBe("POST");
      expect(await requests[0].text()).toBe(JSON.stringify(data));
    });
  });

  describe("resolveComplaints", () => {
    it("dispatches request and success", async () => {
      const resolveComplaintsUrl = "http://example.com/resolveComplaints";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      formData.append("type", "test type");

      server.use(
        http.post(resolveComplaintsUrl, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.resolveComplaints(resolveComplaintsUrl, formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.RESOLVE_COMPLAINTS_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.RESOLVE_COMPLAINTS_SUCCESS
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(resolveComplaintsUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("type")).toBe("test type");
    });
  });

  describe("fetchGenreTree", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const genresData = "test data";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(genresData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchGenreTree("http://example.com/genres")(
        dispatch
      );
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.GENRE_TREE_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.GENRE_TREE_SUCCESS
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        ActionCreator.GENRE_TREE_LOAD
      );
      expect(data).toBe(genresData);
    });
  });

  describe("editClassifications", () => {
    it("dispatches request and success", async () => {
      const editClassificationsUrl = "http://example.com/editClassifications";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      const newGenreTree = ["Drama", "Epic Fantasy", "Women Detectives"];
      newGenreTree.forEach((genre) => formData.append("genres", genre));

      server.use(
        http.post(editClassificationsUrl, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.editClassifications(
        editClassificationsUrl,
        formData
      )(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.EDIT_CLASSIFICATIONS_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.EDIT_CLASSIFICATIONS_SUCCESS
      );
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(editClassificationsUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).getAll("genres")).toEqual(
        newGenreTree
      );
    });
  });

  describe("fetchClassifications", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const classificationsData = {
        book: { id: "test id" },
        classifications: { "test-type": 1 },
      };
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(classificationsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchClassifications(
        "http://example.com/classifications"
      )(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        ActionCreator.CLASSIFICATIONS_REQUEST
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.CLASSIFICATIONS_SUCCESS
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        ActionCreator.CLASSIFICATIONS_LOAD
      );
      expect(data).toBe(classificationsData);
    });
  });

  describe("fetchDiagnostics", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const diagnosticsData = "diagnostics";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(diagnosticsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchDiagnostics()(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[0][0].url).toBe("/admin/diagnostics");
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.DIAGNOSTICS}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(diagnosticsData);
    });
  });

  describe("fetchLibraries", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const librariesData = "libraries";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(librariesData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchLibraries()(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.LIBRARIES}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.LIBRARIES}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(librariesData);
    });
  });

  describe("editLibrary", () => {
    it("dispatches request and success", async () => {
      const editLibraryUrl = "/admin/libraries";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      server.use(
        http.post(editLibraryUrl, () => HttpResponse.text("server response"))
      );

      await actions.editLibrary(formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(editLibraryUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("name")).toBe("new name");
    });
  });

  describe("fetchCollections", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const collectionsData = "collections";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(collectionsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchCollections()(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.COLLECTIONS}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(collectionsData);
    });
  });

  describe("editCollection", () => {
    it("dispatches request and success", async () => {
      const editCollectionUrl = "/admin/collections";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      formData.append("name", "new name");

      server.use(
        http.post(editCollectionUrl, () => HttpResponse.text("server response"))
      );

      await actions.editCollection(formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.EDIT_COLLECTION}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.EDIT_COLLECTION}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(editCollectionUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("name")).toBe("new name");
    });
  });

  describe("importCollection", () => {
    it("dispatches request and success", async () => {
      const importCollectionUrl = "/admin/collection/123/import";
      const dispatch = jest.fn();

      server.use(
        http.post(importCollectionUrl, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.importCollection("123", false)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.IMPORT_COLLECTION}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.IMPORT_COLLECTION}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.IMPORT_COLLECTION}_${ActionCreator.LOAD}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(importCollectionUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("force")).toBe("false");
    });
  });

  describe("fetchIndividualAdmins", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const individualAdminsData = "individualAdmins";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(individualAdminsData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.fetchIndividualAdmins()(dispatch);
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.INDIVIDUAL_ADMINS}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(individualAdminsData);
    });
  });

  describe("editIndividualAdmin", () => {
    it("dispatches request and success", async () => {
      const editIndividualAdminUrl = "/admin/individual_admins";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      formData.append("email", "email");

      server.use(
        http.post(editIndividualAdminUrl, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.editIndividualAdmin(formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.EDIT_INDIVIDUAL_ADMIN}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(editIndividualAdminUrl);
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("email")).toBe("email");
    });
  });

  describe("getSelfTests", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
      const collectionSelfTestURL = "/admin/collection_self_tests";
      const selfTestData = "selfTestData";
      fetcher.testData = {
        ok: true,
        status: 200,
        json: () =>
          new Promise<any>((resolve, _reject) => {
            resolve(selfTestData);
          }),
      };
      fetcher.resolve = true;

      const data = await actions.getSelfTests(`${collectionSelfTestURL}/1`)(
        dispatch
      );
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.GET_SELF_TESTS}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(selfTestData);
    });
  });

  describe("runSelfTests", () => {
    it("dispatches request and success", async () => {
      const collectionUrl = "/admin/collection_self_tests/";
      const collectionSelfTestURL = `${collectionUrl}/1`;
      const dispatch = jest.fn();

      server.use(
        http.post(collectionSelfTestURL, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.runSelfTests(collectionSelfTestURL)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.RUN_SELF_TESTS}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(collectionSelfTestURL);
      expect(requests[0].method).toBe("POST");
    });
  });

  describe("patronLookup", () => {
    it("dispatches request, success, and load", async () => {
      const formData = new (window as any).FormData();
      formData.append("test", "test");
      const dispatch = jest.fn();
      // prettier-ignore
      const response = "{\"id\": \"test\", \"name\": \"test\"}";

      server.use(
        http.post("/nypl/admin/manage_patrons", () =>
          HttpResponse.text(response)
        )
      );

      await actions.patronLookup(formData, "nypl")(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.PATRON_LOOKUP}_${ActionCreator.LOAD}`
      );
      // Node's fetch parses the body into an object from another realm, so
      // toStrictEqual would fail on the prototype.
      expect(dispatch.mock.calls[2][0].data).toEqual(JSON.parse(response));
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(
        "/nypl/admin/manage_patrons"
      );
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("test")).toBe("test");
    });
  });

  describe("resetAdobeId", () => {
    it("dispatches request and success", async () => {
      const formData = new (window as any).FormData();
      const dispatch = jest.fn();

      server.use(
        http.post("/nypl/admin/manage_patrons/reset_adobe_id", () =>
          HttpResponse.text("server response")
        )
      );

      const data = await actions.resetAdobeId(formData, "nypl")(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.RESET_ADOBE_ID}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(
        "/nypl/admin/manage_patrons/reset_adobe_id"
      );
      expect(requests[0].method).toBe("POST");
      // The form has no fields, so check that the body was sent as a form.
      expect(requests[0].headers.get("Content-Type")).toMatch(
        /^multipart\/form-data;/
      );
      expect(data.status).toBe(200);
    });
  });

  describe("clearPatronData", () => {
    it("dispatches load", () => {
      const dispatch = jest.fn();

      actions.clearPatronData()(dispatch);

      expect(dispatch.mock.calls.length).toBe(1);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.CLEAR_PATRON_DATA}_${ActionCreator.LOAD}`
      );
      expect(dispatch.mock.calls[0][0].data).toBe(null);
    });
  });

  describe("fetchMoreCustomListEntries", () => {
    it("dispatches request and load", async () => {
      const dispatch = jest.fn();

      const getState = jest.fn().mockReturnValue({
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

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(customListDetailsData);
    });
  });

  describe("fetchSitewideAnnouncements", () => {
    it("dispatches request, load, and success", async () => {
      const dispatch = jest.fn();
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
      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[0][0].url).toBe("/admin/announcements");
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.LOAD}`
      );
      expect(data).toStrictEqual(sitewideAnnouncementsData);
    });
  });

  describe("editSitewideAnnouncements", () => {
    it("dispatches request and success", async () => {
      const editSitewideAnnouncementsUrl = "/admin/announcements";
      const dispatch = jest.fn();
      const formData = new (window as any).FormData();
      formData.append("announcements", "[]");

      server.use(
        http.post(editSitewideAnnouncementsUrl, () =>
          HttpResponse.text("server response")
        )
      );

      await actions.editSitewideAnnouncements(formData)(dispatch);

      expect(dispatch.mock.calls.length).toBe(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.EDIT_SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.EDIT_SITEWIDE_ANNOUNCEMENTS}_${ActionCreator.SUCCESS}`
      );
      expect(requests).toHaveLength(1);
      expect(new URL(requests[0].url).pathname).toBe(
        editSitewideAnnouncementsUrl
      );
      expect(requests[0].method).toBe("POST");
      expect((await requests[0].formData()).get("announcements")).toBe("[]");
    });
  });

  describe("openCustomListEditor", () => {
    it("dispatches CUSTOM_LIST_DETAILS_CLEAR and OPEN_CUSTOM_LIST_EDITOR", async () => {
      const dispatch = jest.fn();

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

      expect(dispatch.mock.calls.length).toBe(2);

      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.CLEAR}`
      );

      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.OPEN_CUSTOM_LIST_EDITOR
      );
      expect(dispatch.mock.calls[1][0].id).toBe("list_id");
      expect(dispatch.mock.calls[1][0].data).toStrictEqual(
        getState().editor.customLists.data
      );
    });
  });
});
