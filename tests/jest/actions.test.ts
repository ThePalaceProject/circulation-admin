import fetchMock from "fetch-mock-jest";

import ActionCreator from "../../src/actions";

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
    const formData = new FormData();
    formData.append("test", "test");

    it("dispatches request, success, and load", async () => {
      const dispatch = jest.fn();
      const responseText = "response";
      fetchMock.post(url, responseText);

      await actions.postForm(type, url, formData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch).toHaveBeenCalledTimes(3);
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
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe(url);
      expect(fetchArgs[0][1].method).toBe("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).toEqual(expectedHeaders);
      expect(fetchArgs[0][1].body).toBe(formData);
    });

    it("postForm with JSON response dispatches request, success, and load", async () => {
      const dispatch = jest.fn();
      const responseText = '{"id": "test", "name": "test"}';
      fetchMock.mock(url, responseText);

      await actions.postForm(type, url, formData, "POST", "", "JSON")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${type}_${ActionCreator.LOAD}`
      );
      expect(dispatch.mock.calls[2][0].data).toEqual(JSON.parse(responseText));
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe(url);
      expect(fetchArgs[0][1].method).toBe("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).toEqual(expectedHeaders);
      expect(fetchArgs[0][1].body).toBe(formData);
    });

    it("dispatches a DELETE request", async () => {
      const dispatch = jest.fn();
      const responseText = "response";
      fetchMock.mock(url, responseText);

      await actions.postForm(type, url, formData, "DELETE")(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe(url);
      expect(fetchArgs[0][1].method).toBe("DELETE");
      const expectedHeaders = new Headers();
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).toEqual(expectedHeaders);
      expect(fetchArgs[0][1].body).toBe(formData);
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, { status: 500, body: { detail: "problem detail" } });

      await expect(
        actions.postForm(type, url, formData)(dispatch)
      ).rejects.toEqual({
        status: 500,
        response: "problem detail",
        url: url,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.FAILURE}`
      );
      expect(fetchMock.called()).toBe(true);
    });

    it("dispatches failure on non-JSON response", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, { status: 500, body: "Not JSON" });

      await expect(
        actions.postForm(type, url, formData, "POST", "Default error")(dispatch)
      ).rejects.toEqual({
        status: 500,
        response: "Default error",
        url: url,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.FAILURE}`
      );
      expect(fetchMock.called()).toBe(true);
    });

    it("dispatches failure on no response", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, () => {
        throw { message: "test error" };
      });

      await expect(
        actions.postForm(type, url, formData)(dispatch)
      ).rejects.toEqual({
        status: null,
        response: "test error",
        url: url,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.FAILURE}`
      );
      expect(fetchMock.called()).toBe(true);
    });
  });

  describe("postJSON", () => {
    const type = "TEST";
    const url = "http://example.com/test";
    const jsonData = { test: 1 };

    it("dispatches request and success", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, 200);

      await actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch);
      const fetchArgs = fetchMock.calls();

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.SUCCESS}`
      );
      expect(fetchMock.called()).toBe(true);
      expect(fetchArgs[0][0]).toBe(url);
      expect(fetchArgs[0][1].method).toBe("POST");
      const expectedHeaders = new Headers();
      expectedHeaders.append("Accept", "application/json");
      expectedHeaders.append("Content-Type", "application/json");
      expectedHeaders.append("X-CSRF-Token", "token");
      expect(fetchArgs[0][1].headers).toEqual(expectedHeaders);
      expect(fetchArgs[0][1].body).toBe(JSON.stringify(jsonData));
    });

    it("dispatches failure on bad response", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, { status: 500, body: { detail: "problem detail" } });

      await expect(
        actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch)
      ).rejects.toEqual({
        status: 500,
        response: "problem detail",
        url: url,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.FAILURE}`
      );
      expect(fetchMock.called()).toBe(true);
    });

    it("dispatches failure on no response", async () => {
      const dispatch = jest.fn();
      fetchMock.mock(url, () => {
        throw { message: "test error" };
      });

      await expect(
        actions.postJSON<{ test: number }>(type, url, jsonData)(dispatch)
      ).rejects.toEqual({
        status: null,
        response: "test error",
        url: url,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${type}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${type}_${ActionCreator.FAILURE}`
      );
      expect(fetchMock.called()).toBe(true);
    });
  });

  describe("fetchMoreCustomListEntries", () => {
    it("dispatches request, success, and load", async () => {
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

      // fetchMoreCustomListEntries calls dispatch internally on another action creator,
      // so we need an outer dispatch that forwards to the inner
      const outerDispatch = (action) => action(dispatch);

      const data = await actions.fetchMoreCustomListEntries()(
        outerDispatch as any,
        getState
      );

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.REQUEST}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.SUCCESS}`
      );
      expect(dispatch.mock.calls[2][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_${ActionCreator.LOAD}`
      );
      expect(data).toEqual(customListDetailsData);
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

      await actions.openCustomListEditor("list_id")(dispatch, getState as any);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(
        `${ActionCreator.CUSTOM_LIST_DETAILS}_${ActionCreator.CLEAR}`
      );
      expect(dispatch.mock.calls[1][0].type).toBe(
        ActionCreator.OPEN_CUSTOM_LIST_EDITOR
      );
      expect(dispatch.mock.calls[1][0].id).toBe("list_id");
      expect(dispatch.mock.calls[1][0].data).toEqual(
        getState().editor.customLists.data
      );
    });
  });
});
