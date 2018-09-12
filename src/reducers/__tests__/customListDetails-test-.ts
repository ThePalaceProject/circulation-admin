import { expect } from "chai";

import customListDetails from "../customListDetails";
import ActionCreator from "../../actions";

describe("customListDetails reducer", () => {
  let initState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    responseBody: null,
    isLoaded: false,
  };

  it("returns initial state for unrecognized action", () => {
    expect(customListDetails(undefined, {})).to.deep.equal(initState);
  });

  it("handles CUSTOM_LIST_DETAILS_REQUEST", () => {
    let action = { type: `${ActionCreator.CUSTOM_LIST_DETAILS}_REQUEST`, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
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
      isFetching: true,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    let newState = Object.assign({}, oldState, {
      isFetching: true,
      isLoaded: false,
    });

    expect(customListDetails(oldState, action)).to.deep.equal(newState);
  });

  it("handles CUSTOM_LIST_DETAILS_MORE_LOAD", () => {
    let action = {
      type: `${ActionCreator.CUSTOM_LIST_DETAILS_MORE}_LOAD`,
      data: {
        books: [4, 5, 6],
        nextPageUrl: "nextpage?after=100"
      }
    };
    let oldState = {
      url: "test url",
      data: {
        name: "custom list",
        entries: [],
        books: [1, 2, 3],
        nextPageUrl: "nextpage?after=50"
      },
      isFetching: true,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    let newState = Object.assign({}, oldState, {
      data: {
        name: "custom list",
        entries: [],
        books: [1, 2, 3, 4, 5, 6],
        nextPageUrl: "nextpage?after=100"
      },
      isFetching: false,
      isLoaded: true,
    });

    expect(customListDetails(oldState, action)).to.deep.equal(newState);
  });
});
