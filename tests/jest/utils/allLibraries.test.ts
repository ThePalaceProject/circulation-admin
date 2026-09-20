import {
  fetchLibrariesIfNeeded,
  settledAllLibraries,
} from "../../../src/utils/allLibraries";

describe("settledAllLibraries", () => {
  const libraries = [{ short_name: "nypl", name: "New York Public Library" }];
  const stateWith = (librariesState) => ({
    editor: { libraries: librariesState },
  });

  it("returns nothing while the request has not settled", () => {
    expect(settledAllLibraries(stateWith(undefined))).toEqual({});
    expect(
      settledAllLibraries(
        stateWith({ data: null, isLoaded: false, isFetching: true })
      )
    ).toEqual({});
  });

  it("reports not settled when isLoaded is set without a list or error", () => {
    // EDIT_LIBRARY actions can clear fetchError while leaving isLoaded
    // true; that state proves nothing worth showing.
    expect(settledAllLibraries(stateWith({ isLoaded: true }))).toEqual({});
  });

  it("settles an empty loaded list", () => {
    expect(
      settledAllLibraries(
        stateWith({ data: { libraries: [] }, isLoaded: true })
      )
    ).toEqual({
      allLibraries: [],
      allLibrariesError: undefined,
      allLibrariesRefreshError: undefined,
    });
  });

  it("returns the loaded list", () => {
    expect(
      settledAllLibraries(
        stateWith({ data: { libraries }, isLoaded: true, fetchError: null })
      )
    ).toEqual({ allLibraries: libraries, allLibrariesError: undefined });
  });

  it("serves the retained list while a refetch is in flight", () => {
    expect(
      settledAllLibraries(
        stateWith({
          data: null,
          isLoaded: false,
          isFetching: true,
          lastData: { libraries },
        })
      )
    ).toEqual({
      allLibraries: libraries,
      allLibrariesError: undefined,
      allLibrariesRefreshError: undefined,
    });
  });

  it("serves the retained list plus a refresh error after a failed refetch", () => {
    const fetchError = {
      status: 500,
      response: "nope",
      url: "/admin/libraries",
    };
    expect(
      settledAllLibraries(
        stateWith({
          data: null,
          isLoaded: true,
          fetchError,
          lastData: { libraries },
        })
      )
    ).toEqual({
      allLibraries: libraries,
      allLibrariesError: undefined,
      allLibrariesRefreshError: fetchError,
    });
  });

  it("ignores a failure recorded beside a current list", () => {
    // Overlapping requests with mixed outcomes (one LOAD, one FAILURE) can
    // leave a current list next to a recorded failure. The list on screen
    // is up to date, so no error of either kind is reported.
    const fetchError = {
      status: 500,
      response: "nope",
      url: "/admin/libraries",
    };
    expect(
      settledAllLibraries(
        stateWith({ data: { libraries }, isLoaded: true, fetchError })
      )
    ).toEqual({
      allLibraries: libraries,
      allLibrariesError: undefined,
      allLibrariesRefreshError: undefined,
    });
  });

  it("settles to an empty list plus the error on failure", () => {
    const fetchError = {
      status: 500,
      response: "nope",
      url: "/admin/libraries",
    };
    expect(
      settledAllLibraries(stateWith({ data: null, isLoaded: true, fetchError }))
    ).toEqual({ allLibraries: [], allLibrariesError: fetchError });
  });

  it("keeps a previous failure settled while a retry is in flight", () => {
    // The reducer moves the old failure to lastFetchError during a retry.
    const lastFetchError = {
      status: 500,
      response: "nope",
      url: "/admin/libraries",
    };
    expect(
      settledAllLibraries(
        stateWith({
          data: null,
          isLoaded: false,
          isFetching: true,
          fetchError: null,
          lastFetchError,
        })
      )
    ).toEqual({ allLibraries: [], allLibrariesError: lastFetchError });
  });
});

describe("fetchLibrariesIfNeeded", () => {
  const fetchThunk = "libraries thunk";
  const actions = { fetchLibraries: jest.fn(() => fetchThunk) } as any;

  // A dispatch that runs thunks against the given libraries state and
  // records every other dispatched action.
  const makeDispatch = (librariesState) => {
    const dispatched = [];
    const getState = () => ({ editor: { libraries: librariesState } });
    const dispatch = (action) => {
      if (typeof action === "function") {
        return action(dispatch, getState);
      }
      dispatched.push(action);
      return Promise.resolve();
    };
    return { dispatch, dispatched };
  };

  beforeEach(() => jest.clearAllMocks());

  it("fetches when the list has never loaded", () => {
    const { dispatch, dispatched } = makeDispatch(undefined);
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([fetchThunk]);
  });

  it("does not fetch when the list is already loaded", () => {
    const { dispatch, dispatched } = makeDispatch({
      data: { libraries: [] },
      isLoaded: true,
      isFetching: false,
      fetchError: null,
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([]);
  });

  it("fetches when isLoaded is set without a list or error", () => {
    // EDIT_LIBRARY actions can clear fetchError while leaving isLoaded
    // true; there is nothing to show, so fetch.
    const { dispatch, dispatched } = makeDispatch({
      isLoaded: true,
      isFetching: false,
      fetchError: null,
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([fetchThunk]);
  });

  it("retries when a retained list carries a retained failure", () => {
    const { dispatch, dispatched } = makeDispatch({
      data: null,
      isLoaded: false,
      isFetching: false,
      fetchError: null,
      lastData: { libraries: [] },
      lastFetchError: {
        status: 500,
        response: "nope",
        url: "/admin/libraries",
      },
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([fetchThunk]);
  });

  it("does not fetch while a request is already in flight", () => {
    const { dispatch, dispatched } = makeDispatch({
      isLoaded: false,
      isFetching: true,
      fetchError: null,
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([]);
  });

  it("retries when a loaded list has a recorded failure", () => {
    const { dispatch, dispatched } = makeDispatch({
      data: { libraries: [] },
      isLoaded: true,
      isFetching: false,
      fetchError: { status: 500, response: "nope", url: "/admin/libraries" },
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([fetchThunk]);
  });

  it("retries after a failed request", () => {
    const { dispatch, dispatched } = makeDispatch({
      isLoaded: true,
      isFetching: false,
      fetchError: { status: 500, response: "nope", url: "/admin/libraries" },
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([fetchThunk]);
  });
});
