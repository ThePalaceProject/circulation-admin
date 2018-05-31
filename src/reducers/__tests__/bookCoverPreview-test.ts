import { expect } from "chai";

import reducer, { BookCoverPreviewState } from "../bookCoverPreview";
import ActionCreator from "../../actions";

describe("book cover preview reducer", () => {
  let preview = "image data";

  let initState: BookCoverPreviewState = {
    data: null,
    isFetching: false,
    fetchError: null
  };

  let errorState: BookCoverPreviewState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" }
  };

  let loadedState = Object.assign({}, initState, {
    data: preview,
  });

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles PREVIEW_BOOK_COVER_REQUEST", () => {
    let action = { type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.REQUEST}`, url: "test url" };

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

  it("handles PREVIEW_BOOK_COVER_FAILURE", () => {
    let action = { type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.FAILURE}`, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles PREVIEW_BOOK_COVER_LOAD", () => {
    let action = { type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.LOAD}`, data: preview };
    let newState = Object.assign({}, initState, {
      data: preview,
      isFetching: false
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles PREVIEW_BOOK_COVER_CLEAR", () => {
    let action = { type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.CLEAR}` };
    expect(reducer(loadedState, action)).to.deep.equal(initState);
    expect(reducer(errorState, action)).to.deep.equal(initState);
  });
});