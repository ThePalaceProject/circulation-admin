import { expect } from "chai";

import reducer, { LibrariesState } from "../libraries";
import { LibrariesData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("libraries reducer", () => {
  let librariesData: LibrariesData = {
    libraries: [{
      uuid: "1234",
      name: "abcd",
      short_name: "abcd"
    }]
  };

  let initState: LibrariesState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: LibrariesState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles LIBRARIES_REQUEST", () => {
    let action = { type: ActionCreator.LIBRARIES_REQUEST, url: "test_url" };

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

  it("handles LIBRARIES_FAILURE", () => {
    let action = { type: ActionCreator.LIBRARIES_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles LIBRARIES_LOAD", () => {
    let action = { type: ActionCreator.LIBRARIES_LOAD, data: librariesData };
    let newState = Object.assign({}, initState, {
      data: librariesData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_LIBRARY_REQUEST", () => {
    let action = { type: ActionCreator.EDIT_LIBRARY_REQUEST, url: "test url" };

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

  it("handles EDIT_LIBRARY_FAILURE", () => {
    let action = { type: ActionCreator.EDIT_LIBRARY_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_LIBRARY_SUCCESS", () => {
    let action = { type: ActionCreator.EDIT_LIBRARY_SUCCESS };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });
});