import createFetchEditReducer, {
  FetchEditState,
} from "../../../src/reducers/createFetchEditReducer";

describe("fetch-edit reducer", () => {
  interface TestData {
    s: string;
    n: number;
  }

  const testData: TestData = {
    s: "test",
    n: 5,
  };

  const initState: FetchEditState<TestData> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    formError: null,
    isLoaded: false,
    responseBody: null,
    successMessage: null,
  };

  const errorState: FetchEditState<TestData> = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    formError: null,
    isLoaded: true,
    responseBody: null,
    successMessage: null,
  };

  const manipulateData = (state) => {
    const data = 10;
    return Object.assign({}, state, {
      data: data,
      isLoaded: true,
    });
  };

  const extraActions = {
    EXTRA_ACTION_REQUEST: (state) => state,
    EXTRA_ACTION_LOAD: manipulateData,
  };

  const reducer = createFetchEditReducer<TestData>("TEST_FETCH", "TEST_EDIT");
  const fetchOnlyReducer = createFetchEditReducer<TestData>("TEST_FETCH");
  const extraActionReducer = createFetchEditReducer<TestData>(
    "TEST_FETCH",
    "TEST_EDIT",
    extraActions
  );

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).toStrictEqual(initState);
    expect(fetchOnlyReducer(undefined, {})).toStrictEqual(initState);
    expect(extraActionReducer(undefined, {})).toStrictEqual(initState);
  });

  it("handles clear", () => {
    const action = { type: "TEST_FETCH_CLEAR" };

    const state = Object.assign({}, initState, {
      data: testData,
      isLoaded: true,
    });

    expect(reducer(state, action)).toStrictEqual(initState);
  });

  it("handles fetch request", () => {
    const action = { type: "TEST_FETCH_REQUEST", url: "test_url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true,
    });
    expect(reducer(initState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(initState, action)).toStrictEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      isLoaded: false,
      fetchError: null,
    });
    expect(reducer(errorState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(errorState, action)).toStrictEqual(newState);

    // start with loaded state
    const loadedState = Object.assign({}, initState, {
      data: testData,
      isLoaded: true,
    });
    newState = Object.assign({}, loadedState, {
      data: null,
      isLoaded: false,
      isFetching: true,
    });
    expect(reducer(loadedState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(loadedState, action)).toStrictEqual(newState);
  });

  it("handles fetch failure", () => {
    const action = { type: "TEST_FETCH_FAILURE", error: "test error" };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(oldState, action)).toStrictEqual(newState);
  });

  it("handles success", () => {
    const action = { type: "TEST_FETCH_SUCCESS", data: testData };
    const oldState = Object.assign({}, initState, {
      isFetching: true,
    });
    const newState = Object.assign({}, initState, {
      isFetching: false,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(oldState, action)).toStrictEqual(newState);
  });

  it("handles load", () => {
    const action = { type: "TEST_FETCH_LOAD", data: testData };
    const newState = Object.assign({}, initState, {
      data: testData,
      isFetching: false,
      isLoaded: true,
    });
    expect(reducer(initState, action)).toStrictEqual(newState);
    expect(fetchOnlyReducer(initState, action)).toStrictEqual(newState);
  });

  it("handles edit request", () => {
    const action = { type: "TEST_EDIT_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditing: true,
    });
    expect(reducer(initState, action)).toStrictEqual(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(initState, action)).toStrictEqual(initState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditing: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).toStrictEqual(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(errorState, action)).toStrictEqual(errorState);
  });

  it("handles edit failure", () => {
    const action = { type: "TEST_EDIT_FAILURE", error: "test error" };
    const oldState = Object.assign({}, initState, {
      isEditing: true,
    });
    const newState = Object.assign({}, oldState, {
      formError: "test error",
      isEditing: false,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(oldState, action)).toStrictEqual(oldState);
  });

  it("handles edit success", () => {
    const action = { type: "TEST_EDIT_SUCCESS" };
    const oldState = Object.assign({}, initState, {
      isEditing: true,
    });
    const newState = Object.assign({}, oldState, {
      isEditing: false,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(oldState, action)).toStrictEqual(oldState);
  });

  it("handles edit load", () => {
    const action = { type: "TEST_EDIT_LOAD", data: "5" };
    const newState = Object.assign({}, initState, {
      responseBody: "5",
      successMessage: "5",
    });
    expect(reducer(initState, action)).toStrictEqual(newState);
    // fetch only reducer does nothing
    expect(fetchOnlyReducer(initState, action)).toStrictEqual(initState);
  });

  it("handles extra action request", () => {
    const action = { type: "EXTRA_ACTION_REQUEST", url: "test url" };

    // start with empty state
    const newState = Object.assign({}, initState);
    expect(extraActionReducer(initState, action)).toStrictEqual(newState);
  });

  it("handles extra action data load", () => {
    const action = { type: "EXTRA_ACTION_LOAD", url: "test url" };
    const newState = Object.assign({}, initState, {
      data: 10,
      isLoaded: true,
    });

    expect(extraActionReducer(initState, action)).toStrictEqual(newState);
  });
});
