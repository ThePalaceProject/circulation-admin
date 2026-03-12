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
