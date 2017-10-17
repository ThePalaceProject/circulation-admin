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
    isLoaded: false,
    editedIdentifier: null
  };

  let errorState: FetchEditState<TestData> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    isLoaded: true,
    editedIdentifier: null
  };

  let reducer = createFetchEditReducer<TestData>("TEST_FETCH", "TEST_EDIT");
  let fetchOnlyReducer = createFetchEditReducer<TestData>("TEST_FETCH");

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
    expect(fetchOnlyReducer(undefined, {})).to.deep.equal(initState);
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
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
    expect(fetchOnlyReducer(errorState, action)).to.deep.equal(newState);
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
      fetchError: "test error",
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
      editedIdentifier: "5"
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(initState, action)).to.deep.equal(initState);
  });
});