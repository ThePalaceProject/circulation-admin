jest.dontMock("../genres");

import reducer, { GenresState } from "../genres";

describe("genres reducer", () => {
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

  let initState: GenresState = {
    genres: null,
    classifications: null,
    isFetchingGenres: false,
    isUpdatingGenres: false,
    isFetchingClassifications: false,
    fetchError: null
  };

  let errorState: GenresState = {
    genres: null,
    classifications: null,
    isFetchingGenres: false,
    isUpdatingGenres: false,
    isFetchingClassifications: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).toEqual(initState);
  });

  it("handles FETCH_GENRES_REQUEST", () => {
    let action = { type: "FETCH_GENRES_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingGenres: true
    });
    expect(reducer(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingGenres: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).toEqual(newState);
  });

  it("handles FETCH_GENRES_FAILURE", () => {
    let action = { type: "FETCH_GENRES_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingGenres: false
    });
    expect(reducer(oldState, action)).toEqual(newState)
  });

  it("handles LOAD_GENRES", () => {
    let action = { type: "LOAD_GENRES", data: genreData };
    let newState = Object.assign({}, initState, {
      genres: genreData,
      isFetchingGenres: false
    });
    expect(reducer(initState, action)).toEqual(newState);
  });

  it("handles UPDATE_GENRES_REQUEST", () => {
    let action = { type: "UPDATE_GENRES_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isUpdatingGenres: true
    });
    expect(reducer(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isUpdatingGenres: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).toEqual(newState);
  });

  it("handles UPDATE_GENRES_FAILURE", () => {
    let action = { type: "UPDATE_GENRES_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, {
      isUpdatingGenres: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isUpdatingGenres: false
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