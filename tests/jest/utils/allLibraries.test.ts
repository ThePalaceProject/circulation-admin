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

  it("returns the loaded list", () => {
    expect(
      settledAllLibraries(
        stateWith({ data: { libraries }, isLoaded: true, fetchError: null })
      )
    ).toEqual({ allLibraries: libraries, allLibrariesError: undefined });
  });

  it("reports a failure next to a loaded list as a refresh error", () => {
    // Two overlapping requests, or a failed refresh of a loaded list, can
    // leave a list next to a recorded failure; the list wins and the
    // failure downgrades to a non-blocking refresh error.
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
      allLibrariesRefreshError: fetchError,
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
      isLoaded: true,
      isFetching: false,
      fetchError: null,
    });
    fetchLibrariesIfNeeded(dispatch, actions);
    expect(dispatched).toEqual([]);
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
