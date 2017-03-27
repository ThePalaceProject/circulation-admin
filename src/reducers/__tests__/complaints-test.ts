import { expect } from "chai";

import complaints from "../complaints";
import ActionCreator from "../../actions";

describe("complaints reducer", () => {
  let initState = {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null,
    postError: null,
    resolveError: null
  };

  let errorState = {
    url: "test url",
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
    postError: null,
    resolveError: null
  };

  it("returns initial state for unrecognized action", () => {
    expect(complaints(undefined, {})).to.deep.equal(initState);
  });

  it("handles COMPLAINTS_REQUEST", () => {
    let action = { type: ActionCreator.COMPLAINTS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      url: "test url",
      isFetching: true
    });
    expect(complaints(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(complaints(errorState, action)).to.deep.equal(newState);
  });

  it("handles COMPLAINTS_FAILURE", () => {
    let action = { type: ActionCreator.COMPLAINTS_FAILURE, error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      postError: null,
      resolveError: null
    };
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });

  it("handles COMPLAINTS_LOAD", () => {
    let action = { type: ActionCreator.COMPLAINTS_LOAD, data: { complaints: "test data" } };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      postError: null,
      resolveError: null
    };
    let newState = Object.assign({}, oldState, {
      data: "test data",
      isFetching: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });

  it("handles POST_COMPLAINT_REQUEST", () => {
    let action = { type: ActionCreator.POST_COMPLAINT_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      url: "test url",
      isFetching: true
    });
    expect(complaints(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(complaints(errorState, action)).to.deep.equal(newState);
  });

  it("handles POST_COMPLAINT_FAILURE", () => {
    let action = { type: ActionCreator.POST_COMPLAINT_FAILURE, error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      postError: null,
      resolveError: null
    };
    let newState = Object.assign({}, oldState, {
      postError: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });

  it("handles RESOLVE_COMPLAINTS_REQUEST", () => {
    let action = { type: ActionCreator.RESOLVE_COMPLAINTS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      url: "test url",
      isFetching: true
    });
    expect(complaints(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(complaints(errorState, action)).to.deep.equal(newState);
  });

  it("handles RESOLVE_COMPLAINTS_FAILURE", () => {
    let action = { type: ActionCreator.RESOLVE_COMPLAINTS_FAILURE, error: "test error" };
    let oldState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: null,
      postError: null,
      resolveError: null
    };
    let newState = Object.assign({}, oldState, {
      resolveError: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).to.deep.equal(newState);
  });
});