import libraries from "../../../src/reducers/libraries";
import ActionCreator from "../../../src/actions";

const REQUEST = `${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}`;
const FAILURE = `${ActionCreator.LIBRARIES}_${ActionCreator.FAILURE}`;
const SUCCESS = `${ActionCreator.LIBRARIES}_${ActionCreator.SUCCESS}`;
const LOAD = `${ActionCreator.LIBRARIES}_${ActionCreator.LOAD}`;

describe("libraries reducer", () => {
  const fetchError = { status: 500, response: "nope", url: "/admin/libraries" };

  it("clears state on a first-load request", () => {
    const state = libraries(undefined, { type: REQUEST });
    expect(state.isFetching).toBe(true);
    expect(state.isLoaded).toBe(false);
    expect(state.fetchError).toBeNull();
  });

  it("moves the previous failure to lastFetchError while a retry is in flight", () => {
    const failed = libraries(undefined, { type: FAILURE, error: fetchError });
    expect(failed.fetchError).toEqual(fetchError);
    expect(failed.isLoaded).toBe(true);

    const retrying = libraries(failed, { type: REQUEST });
    expect(retrying.isFetching).toBe(true);
    // fetchError keeps meaning "the current request failed"; the old
    // failure moves to lastFetchError so consumers can keep showing it.
    expect(retrying.fetchError).toBeNull();
    expect(retrying.lastFetchError).toEqual(fetchError);
    expect(retrying.isLoaded).toBe(false);
  });

  it("keeps the loaded list while a refetch is in flight", () => {
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: LOAD, data });
    state = libraries(state, { type: REQUEST });

    expect(state.isFetching).toBe(true);
    expect(state.data).toEqual(data);
    expect(state.isLoaded).toBe(true);
  });

  it("keeps lastFetchError when a second request starts before the retry settles", () => {
    // The header's fetch and the Libraries tab's fetch can overlap.
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: REQUEST });

    expect(state.fetchError).toBeNull();
    expect(state.lastFetchError).toEqual(fetchError);
  });

  it("keeps lastFetchError through a retry's SUCCESS until LOAD", () => {
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: SUCCESS });

    expect(state.data).toBeNull();
    expect(state.isLoaded).toBe(false);
    expect(state.fetchError).toBeNull();
    expect(state.lastFetchError).toEqual(fetchError);
  });

  it("clears the old failure once a retry succeeds", () => {
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: SUCCESS });
    state = libraries(state, { type: LOAD, data });

    expect(state.fetchError).toBeNull();
    expect(state.lastFetchError).toBeNull();
    expect(state.isLoaded).toBe(true);
    expect(state.data).toEqual(data);
  });

  it("reports only the new failure when a retry fails again", () => {
    const newError = {
      status: 502,
      response: "worse",
      url: "/admin/libraries",
    };
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: FAILURE, error: newError });

    expect(state.fetchError).toEqual(newError);
    expect(state.lastFetchError).toBeNull();
  });
});
