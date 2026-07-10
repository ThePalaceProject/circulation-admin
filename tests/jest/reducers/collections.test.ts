import collections from "../../../src/reducers/collections";
import ActionCreator from "../../../src/actions";

describe("collections reducer", () => {
  const initState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    formError: null,
    responseBody: null,
    isLoaded: false,
    successMessage: null,
  };

  it("returns initial state for unrecognized action", () => {
    expect(collections(undefined, {})).toStrictEqual(initState);
  });

  it("handles COLLECTIONS_REQUEST", () => {
    const action = {
      type: `${ActionCreator.COLLECTIONS}_REQUEST`,
      url: "test url",
    };

    // start with empty state
    const newState = Object.assign({}, initState, {
      isFetching: true,
    });
    expect(collections(initState, action)).toStrictEqual(newState);
  });

  it("handles EDIT_COLLECTION_REQUEST", () => {
    const action = { type: `${ActionCreator.EDIT_COLLECTION}_REQUEST` };
    const newState = Object.assign({}, initState, {
      fetchError: null,
      isFetching: false,
      isEditing: true,
    });
    expect(collections(initState, action)).toStrictEqual(newState);
  });

  it("handles GET_SELF_TESTS_LOAD", () => {
    const emptySelfTestData = {
      duration: null,
      start: "",
      end: "",
      results: [],
    };
    const selfTestData = {
      duration: 0.12,
      start: "start",
      end: "end",
      results: [],
    };
    const action = {
      type: `${ActionCreator.GET_SELF_TESTS}_LOAD`,
      data: {
        self_test_results: {
          id: 1,
          self_test_results: selfTestData,
          protocol: "",
        },
      },
    };
    const oldState = {
      url: "test url",
      data: {
        collections: [
          { id: 1, self_test_results: emptySelfTestData, protocol: "" },
          { id: 2, protocol: "" },
        ],
        protocols: [],
      },
      isFetching: true,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    const newState = Object.assign({}, oldState, {
      data: {
        collections: [
          { id: 1, self_test_results: selfTestData, protocol: "" },
          { id: 2, protocol: "" },
        ],
        protocols: [],
      },
      isFetching: false,
      isLoaded: true,
    });

    expect(collections(oldState, action)).toStrictEqual(newState);
  });
});
