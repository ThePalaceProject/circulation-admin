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

  it("keeps the failed state visible while a retry is in flight", () => {
    const failed = libraries(undefined, { type: FAILURE, error: fetchError });
    expect(failed.fetchError).toEqual(fetchError);
    expect(failed.isLoaded).toBe(true);

    const retrying = libraries(failed, { type: REQUEST });
    expect(retrying.isFetching).toBe(true);
    expect(retrying.fetchError).toEqual(fetchError);
    expect(retrying.isLoaded).toBe(true);
  });

  it("clears the failure once a retry succeeds", () => {
    const data = { libraries: [{ short_name: "nypl" }] };
    let state = libraries(undefined, { type: FAILURE, error: fetchError });
    state = libraries(state, { type: REQUEST });
    state = libraries(state, { type: SUCCESS });
    state = libraries(state, { type: LOAD, data });

    expect(state.fetchError).toBeNull();
    expect(state.isLoaded).toBe(true);
    expect(state.data).toEqual(data);
  });
});
