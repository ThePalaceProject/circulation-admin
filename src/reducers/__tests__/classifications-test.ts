import { expect } from "chai";

import reducer, { ClassificationsState } from "../classifications";
import ActionCreator from "../../actions";

describe("classifications reducer", () => {
  const genreData = {
    Fiction: {},
    Nonfiction: {},
  };

  const classificationsData = [
    {
      type: "type",
      name: "name",
      source: "source",
      weight: "weight",
    },
  ];

  const initState: ClassificationsState = {
    genreTree: null,
    classifications: null,
    isFetchingGenreTree: false,
    isEditingClassifications: false,
    isFetchingClassifications: false,
    fetchError: null,
  };

  const errorState: ClassificationsState = {
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
    const action = { type: ActionCreator.GENRE_TREE_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingGenreTree: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingGenreTree: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles GENRE_TREE_FAILURE", () => {
    const action = {
      type: ActionCreator.GENRE_TREE_FAILURE,
      error: "test error",
    };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingGenreTree: false,
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles GENRE_TREE_LOAD", () => {
    const action = { type: ActionCreator.GENRE_TREE_LOAD, data: genreData };
    const newState = Object.assign({}, initState, {
      genreTree: genreData,
      isFetchingGenreTree: false,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_REQUEST", () => {
    const action = {
      type: ActionCreator.EDIT_CLASSIFICATIONS_REQUEST,
      url: "test url",
    };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditingClassifications: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditingClassifications: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_CLASSIFICATIONS_FAILURE", () => {
    const action = {
      type: ActionCreator.EDIT_CLASSIFICATIONS_FAILURE,
      error: "test error",
    };
    const oldState = Object.assign({}, initState, {
      isEditingClassifications: true,
    });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditingClassifications: false,
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_REQUEST", () => {
    const action = {
      type: ActionCreator.CLASSIFICATIONS_REQUEST,
      url: "test url",
    };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetchingClassifications: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetchingClassifications: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_FAILURE", () => {
    const action = {
      type: ActionCreator.CLASSIFICATIONS_FAILURE,
      error: "test error",
    };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetchingClassifications: false,
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles CLASSIFICATIONS_LOAD", () => {
    const action = {
      type: ActionCreator.CLASSIFICATIONS_LOAD,
      data: { classifications: classificationsData },
    };
    const newState = Object.assign({}, initState, {
      classifications: classificationsData,
      isFetchingClassifications: false,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});
