import { expect } from "chai";

import createFetchEditReducer, { FetchEditState } from "../createFetchEditReducer";

describe("fetch-edit reducer", () => {
  interface TestData {
    s: string;
    n: number;
  }

  let testData: TestData = {
    s: "test",
    n: 5
  };

  let initState: FetchEditState<TestData> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    formError: null,
    isLoaded: false,
    responseBody: null,
    successMessage: null
  };

  let errorState: FetchEditState<TestData> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    formError: null,
    isLoaded: true,
    responseBody: null,
    successMessage: null
  };

  const manipulateData = (state, action) => {
    let data = 10;
    return Object.assign({}, state, {
      data: data,
      isLoaded: true,
    });
  };

  const extraActions = {
    EXTRA_ACTION_REQUEST: (state, action) => state,
    EXTRA_ACTION_LOAD: manipulateData,
  };

  let reducer = createFetchEditReducer<TestData>("TEST_FETCH", "TEST_EDIT");
  let fetchOnlyReducer = createFetchEditReducer<TestData>("TEST_FETCH");
  let extraActionReducer = createFetchEditReducer<TestData>("TEST_FETCH", "TEST_EDIT", extraActions);

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
    expect(fetchOnlyReducer(undefined, {})).to.deep.equal(initState);
    expect(extraActionReducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles fetch request", () => {
    let action = { type: "TEST_FETCH_REQUEST", url: "test_url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      isLoaded: false,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(errorState, action)).to.deep.equal(newState);

    // start with loaded state
    let loadedState = Object.assign({}, initState, {
      data: testData,
      isLoaded: true
    });
    newState = Object.assign({}, loadedState, {
      data: null,
      isLoaded: false,
      isFetching: true
    });
    expect(reducer(loadedState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(loadedState, action)).to.deep.equal(newState);
  });

  it("handles fetch failure", () => {
    let action = { type: "TEST_FETCH_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles load", () => {
    let action = { type: "TEST_FETCH_LOAD", data: testData };
    let newState = Object.assign({}, initState, {
      data: testData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(initState, action)).to.deep.equal(newState);
  });

  it("handles edit request", () => {
    let action = { type: "TEST_EDIT_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditing: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(initState, action)).to.deep.equal(initState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditing: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(errorState, action)).to.deep.equal(errorState);
  });

  it("handles edit failure", () => {
    let action = { type: "TEST_EDIT_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      formError: "test error",
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(oldState, action)).to.deep.equal(oldState);
  });

  it("handles edit success", () => {
    let action = { type: "TEST_EDIT_SUCCESS" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(oldState, action)).to.deep.equal(oldState);
  });

  it("handles edit load", () => {
    let action = { type: "TEST_EDIT_LOAD", data: "5" };
    let newState = Object.assign({}, initState, {
      responseBody: "5",
      successMessage: "5"
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(initState, action)).to.deep.equal(initState);
  });

  it("handles extra action request", () => {
    let action = { type: "EXTRA_ACTION_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState);
    expect(extraActionReducer(initState, action)).to.deep.equal(newState);
  });

  it("handles extra action data load", () => {
    let action = { type: "EXTRA_ACTION_LOAD", url: "test url" };
    let newState = Object.assign({}, initState, {
      data: 10,
      isLoaded: true,
    });

    expect(extraActionReducer(initState, action)).to.deep.equal(newState);
  });
});
