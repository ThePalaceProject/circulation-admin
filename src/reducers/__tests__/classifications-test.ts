import { expect } from "chai";

import reducer, { ClassificationsState } from "../classifications";
import ActionCreator from "../../actions";

describe("classifications reducer", () => {
  let genreData = {
    Fiction: {},
    Nonfiction: {}
  };

  let classificationsData = [ {
    type: "type",
    name: "name",
    source: "source",
    weight: "weight"
  } ];

  let initState: ClassificationsState = {
    genreTree: null,
    classifications: null,
    isFetchingGenreTree: false,
    isEditingClassifications: false,
    isFetchingClassifications: false,
    fetchError: null
  };

  let errorState: ClassificationsState = {
    genreTree: null,
    classifications: null,
    isFetchingGenreTree: false,
    isEditingClassifications: false,
    isFetchingClassifications: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles GENRE_TREE_REQUEST", () => {
    let action = { type: ActionCreator.GENRE_TREE_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingGenreTree: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingGenreTree: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles GENRE_TREE_FAILURE", () => {
    let action = { type: ActionCreator.GENRE_TREE_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingGenreTree: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles GENRE_TREE_LOAD", () => {
    let action = { type: ActionCreator.GENRE_TREE_LOAD, data: genreData };
    let newState = Object.assign({}, initState, {
      genreTree: genreData,
      isFetchingGenreTree: false
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_REQUEST", () => {
    let action = { type: ActionCreator.EDIT_CLASSIFICATIONS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditingClassifications: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditingClassifications: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_FAILURE", () => {
    let action = { type: ActionCreator.EDIT_CLASSIFICATIONS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditingClassifications: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditingClassifications: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_REQUEST", () => {
    let action = { type: ActionCreator.CLASSIFICATIONS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingClassifications: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingClassifications: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_FAILURE", () => {
    let action = { type: ActionCreator.CLASSIFICATIONS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingClassifications: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_LOAD", () => {
    let action = { type: ActionCreator.CLASSIFICATIONS_LOAD, data: { classifications: classificationsData } };
    let newState = Object.assign({}, initState, {
      classifications: classificationsData,
      isFetchingClassifications: false
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});