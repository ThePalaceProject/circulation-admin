import { expect } from "chai";

import customListDetails from "../customListDetails";
import ActionCreator from "../../actions";

describe("customListDetails reducer", () => {
  let initState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    formError: null,
    responseBody: null,
    successMessage: null,
    isLoaded: false,
  };

  it("returns initial state for unrecognized action", () => {
    expect(customListDetails(undefined, {})).to.deep.equal(initState);
  });

  it("handles CUSTOM_LIST_DETAILS_REQUEST", () => {
    let action = { type: `${ActionCreator.CUSTOM_LIST_DETAILS}_REQUEST`, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true,
    });
    expect(customListDetails(initState, action)).to.deep.equal(newState);
  });

  it("handles CUSTOM_LIST_DETAILS_MORE_REQUEST", () => {
    let action = {
      type: `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_REQUEST`,
      url: "test url"
    };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: false,
      isFetchingMoreEntries: false,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    let newState = Object.assign({}, oldState, {
      isFetchingMoreEntries: true,
      isLoaded: false,
    });

    expect(customListDetails(oldState, action)).to.deep.equal(newState);
  });

  it("handles CUSTOM_LIST_DETAILS_MORE_LOAD", () => {
    let action = {
      type: `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_LOAD`,
      data: {
        id: "1",
        url: "url",
        books: [{ id: "4", title: "4" }, { id: "5", title: "5" }, { id: "6", title: "6" }],
        nextPageUrl: "nextpage?after=100",
        navigationLinks: [],
        lanes: [],
      }
    };
    let oldState = {
      url: "test url",
      data: {
        id: "1",
        url: "url",
        title: "custom list",
        books: [{ id: "1", title: "1" }, { id: "2", title: "2" }, { id: "3", title: "3" }],
        nextPageUrl: "nextpage?after=50",
        navigationLinks: [],
        lanes: [],
      },
      isFetching: false,
      isFetchingMoreEntries: false,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    let newState = Object.assign({}, oldState, {
      data: {
        id: "1",
        url: "url",
        title: "custom list",
        books: [
          { id: "1", title: "1" }, { id: "2", title: "2" }, { id: "3", title: "3" },
          { id: "4", title: "4" }, { id: "5", title: "5" }, { id: "6", title: "6" },
        ],
        nextPageUrl: "nextpage?after=100",
        navigationLinks: [],
        lanes: [],
      },
      isFetching: false,
      isFetchingMoreEntries: false,
      isLoaded: true,
    });

    expect(customListDetails(oldState, action)).to.deep.equal(newState);
  });
});
