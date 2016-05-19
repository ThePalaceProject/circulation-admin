jest.dontMock("../classifications");

import reducer, { ClassificationsState } from "../classifications";

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
    expect(reducer(undefined, {})).toEqual(initState);
  });

  it("handles FETCH_GENRE_TREE_REQUEST", () => {
    let action = { type: "FETCH_GENRE_TREE_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingGenreTree: true
    });
    expect(reducer(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingGenreTree: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).toEqual(newState);
  });

  it("handles FETCH_GENRE_TREE_FAILURE", () => {
    let action = { type: "FETCH_GENRE_TREE_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingGenreTree: false
    });
    expect(reducer(oldState, action)).toEqual(newState)
  });

  it("handles LOAD_GENRE_TREE", () => {
    let action = { type: "LOAD_GENRE_TREE", data: genreData };
    let newState = Object.assign({}, initState, {
      genreTree: genreData,
      isFetchingGenreTree: false
    });
    expect(reducer(initState, action)).toEqual(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_REQUEST", () => {
    let action = { type: "EDIT_CLASSIFICATIONS_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditingClassifications: true
    });
    expect(reducer(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditingClassifications: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).toEqual(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_FAILURE", () => {
    let action = { type: "EDIT_CLASSIFICATIONS_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditingClassifications: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditingClassifications: false
    });
    expect(reducer(oldState, action)).toEqual(newState)
  });

  it("handles FETCH_CLASSIFICATIONS_REQUEST", () => {
    let action = { type: "FETCH_CLASSIFICATIONS_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingClassifications: true
    });
    expect(reducer(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingClassifications: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).toEqual(newState);
  });

  it("handles FETCH_CLASSIFICATIONS_FAILURE", () => {
    let action = { type: "FETCH_CLASSIFICATIONS_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingClassifications: false
    });
    expect(reducer(oldState, action)).toEqual(newState)
  });

  it("handles LOAD_CLASSIFICATIONS", () => {
    let action = { type: "LOAD_CLASSIFICATIONS", classifications: classificationsData };
    let newState = Object.assign({}, initState, {
      classifications: classificationsData,
      isFetchingClassifications: false
    });
    expect(reducer(initState, action)).toEqual(newState);
  });
});