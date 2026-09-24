import libraries from "../../../src/reducers/libraries";
import ActionCreator from "../../../src/actions";

const REQUEST = `${ActionCreator.LIBRARIES}_${ActionCreator.REQUEST}`;
const FAILURE = `${ActionCreator.LIBRARIES}_${ActionCreator.FAILURE}`;
const SUCCESS = `${ActionCreator.LIBRARIES}_${ActionCreator.SUCCESS}`;
const LOAD = `${ActionCreator.LIBRARIES}_${ActionCreator.LOAD}`;
const EDIT_REQUEST = `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.REQUEST}`;
const EDIT_SUCCESS = `${ActionCreator.EDIT_LIBRARY}_${ActionCreator.SUCCESS}`;

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

  it("retains the loaded list as lastData while a refetch is in flight", () => {
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: LOAD, data });
    state = libraries(state, { type: REQUEST });

    expect(state.isFetching).toBe(true);
    // data keeps its normal lifecycle (nulled by REQUEST) for the Libraries
    // config page; the retained copy moves to lastData.
    expect(state.data).toBeNull();
    expect(state.isLoaded).toBe(false);
    expect(state.lastData).toEqual(data);
  });

  it("keeps lastData through a failed refetch and clears it on a fresh load", () => {
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: LOAD, data });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: FAILURE, error: fetchError });
    expect(state.lastData).toEqual(data);
    expect(state.fetchError).toEqual(fetchError);

    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: SUCCESS });
    state = libraries(state, { type: LOAD, data });
    expect(state.lastData).toBeNull();
    expect(state.data).toEqual(data);
  });

  it("drops a failure recorded beside current data when a refetch starts", () => {
    // Overlapping requests with mixed outcomes leave data plus fetchError.
    // Consumers ignore that failure, so it must not resurface against the
    // retained copy while the next refetch runs.
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: LOAD, data });
    state = libraries(state, { type: FAILURE, error: fetchError });
    expect(state.data).toEqual(data);
    expect(state.fetchError).toEqual(fetchError);

    state = libraries(state, { type: REQUEST });
    expect(state.lastData).toEqual(data);
    expect(state.lastFetchError).toBeNull();
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

  it("keeps a list-fetch failure when a library form submit starts", () => {
    // EDIT_LIBRARY_REQUEST shares this reducer and clears fetchError; the
    // failure must survive as lastFetchError so consumers do not mistake
    // the state for a cleanly loaded list.
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: EDIT_REQUEST });

    expect(state.fetchError).toBeNull();
    expect(state.lastFetchError).toEqual(fetchError);
  });

  it("keeps an already-retained failure when a library form submit starts", () => {
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: EDIT_REQUEST });

    expect(state.lastFetchError).toEqual(fetchError);
  });

  it("does not invent a failure when a library form submit starts cleanly", () => {
    const state = libraries(undefined, { type: EDIT_REQUEST });
    expect(state.lastFetchError).toBeNull();
  });

  it("keeps a list-fetch failure when a library form submit succeeds", () => {
    // A list refetch can fail between EDIT_LIBRARY_REQUEST and its
    // SUCCESS, and the base reducer's SUCCESS also clears fetchError.
    let state = libraries(undefined, { type: REQUEST });
    state = libraries(state, { type: EDIT_REQUEST });
    state = libraries(state, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: EDIT_SUCCESS });

    expect(state.fetchError).toBeNull();
    expect(state.lastFetchError).toEqual(fetchError);
  });

  it("drops a failure beside current data when a library form submit starts", () => {
    // Same rule as LIBRARIES_REQUEST: consumers ignore that failure.
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: LOAD, data });
    state = libraries(state, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: EDIT_REQUEST });

    expect(state.lastFetchError).toBeNull();
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
