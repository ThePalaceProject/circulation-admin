jest.dontMock("../book");

import book from "../book";

describe("book reducer", () => {
  let initState = {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null,
    editError: null
  };

  let fetchedState = {
    url: "test url",
    data: "test data",
    isFetching: false,
    fetchError: null,
    editError: null
  };

  it("returns initial state for unrecognized action", () => {
    expect(book(undefined, {})).toEqual(initState);
  });

  it("handles FETCH_BOOK_REQUEST", () => {
    let action = { type: "FETCH_BOOK_REQUEST", url: "test url" };
    let newState = Object.assign({}, initState, {
      url: "test url",
      isFetching: true
    });
    expect(book(initState, action)).toEqual(newState);
  });

  it("handles EDIT_BOOK_REQUEST", () => {
    let action = { type: "EDIT_BOOK_REQUEST" };
    let newState = Object.assign({}, fetchedState, {
      isFetching: true
    });
    expect(book(fetchedState, action)).toEqual(newState);
  });

  it("handles FETCH_BOOK_FAILURE", () => {
    let action = { type: "FETCH_BOOK_FAILURE", error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      editError: null
    };
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false
    });
    expect(book(oldState, action)).toEqual(newState)
  });

  it("handles EDIT_BOOK_FAILURE", () => {
    let action = { type: "EDIT_BOOK_FAILURE", error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      editError: null
    };
    let newState = Object.assign({}, oldState, {
      editError: "test error",
      isFetching: false
    });
    expect(book(oldState, action)).toEqual(newState)
  });

  it("handles LOAD_BOOK", () => {
    let action = { type: "LOAD_BOOK", data: "test data", url: "test url" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      editError: null
    };
    let newState = Object.assign({}, oldState, {
      data: "test data",
      isFetching: false
    });
    expect(book(oldState, action)).toEqual(newState);
  });
});