import reducer, {
  BookCoverPreviewState,
} from "../../../src/reducers/bookCoverPreview";
import ActionCreator from "../../../src/actions";

describe("book cover preview reducer", () => {
  const preview = "image data";

  const initState: BookCoverPreviewState = {
    data: null,
    isFetching: false,
    fetchError: null,
  };

  const errorState: BookCoverPreviewState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
  };

  const loadedState = Object.assign({}, initState, {
    data: preview,
  });

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).toStrictEqual(initState);
  });

  it("handles PREVIEW_BOOK_COVER_REQUEST", () => {
    const action = {
      type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.REQUEST}`,
      url: "test url",
    };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true,
    });
    expect(reducer(initState, action)).toStrictEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).toStrictEqual(newState);
  });

  it("handles PREVIEW_BOOK_COVER_FAILURE", () => {
    const action = {
      type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.FAILURE}`,
      error: "test error",
    };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
    });
    expect(reducer(oldState, action)).toStrictEqual(newState);
  });

  it("handles PREVIEW_BOOK_COVER_LOAD", () => {
    const action = {
      type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.LOAD}`,
      data: preview,
    };
    const newState = Object.assign({}, initState, {
      data: preview,
      isFetching: false,
    });
    expect(reducer(initState, action)).toStrictEqual(newState);
  });

  it("handles PREVIEW_BOOK_COVER_CLEAR", () => {
    const action = {
      type: `${ActionCreator.PREVIEW_BOOK_COVER}_${ActionCreator.CLEAR}`,
    };
    expect(reducer(loadedState, action)).toStrictEqual(initState);
    expect(reducer(errorState, action)).toStrictEqual(initState);
  });
});
