import { expect } from "chai";

import reducer, { CollectionsState } from "../collections";
import { CollectionsData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("collections reducer", () => {
  let collectionsData: CollectionsData = {
    collections: [{
      name: "abcd",
      protocol: "OPDS Import",
      libraries: [],
    }],
    protocols: [{
      name: "a",
      fields: [{ key: "key", label: "label" }]
    }, {
      name: "b",
      fields: []
    }]
  };

  let initState: CollectionsState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: CollectionsState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles COLLECTIONS_REQUEST", () => {
    let action = { type: ActionCreator.COLLECTIONS_REQUEST, url: "test_url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles COLLECTIONS_FAILURE", () => {
    let action = { type: ActionCreator.COLLECTIONS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles COLLECTIONS_LOAD", () => {
    let action = { type: ActionCreator.COLLECTIONS_LOAD, data: collectionsData };
    let newState = Object.assign({}, initState, {
      data: collectionsData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_COLLECTION_REQUEST", () => {
    let action = { type: ActionCreator.EDIT_COLLECTION_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditing: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditing: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_COLLECTION_FAILURE", () => {
    let action = { type: ActionCreator.EDIT_COLLECTION_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_COLLECTION_SUCCESS", () => {
    let action = { type: ActionCreator.EDIT_COLLECTION_SUCCESS };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });
});
