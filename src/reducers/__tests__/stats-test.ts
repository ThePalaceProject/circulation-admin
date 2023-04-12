import { expect } from "chai";

import reducer, { StatsState } from "../stats";
import { statisticsApiResponseData } from "../../../tests/__data__/statisticsApiResponseData";
import ActionCreator from "../../actions";

describe("stats reducer", () => {
  const initState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: null,
    isLoaded: false,
  };

  const errorState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
    isLoaded: true,
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles STATS_REQUEST", () => {
    const action = { type: ActionCreator.STATS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null,
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles STATS_FAILURE", () => {
    const action = { type: ActionCreator.STATS_FAILURE, error: "test error" };
    const oldState = Object.assign({}, initState, { isFetching: true });
    const newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true,
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles STATS_LOAD", () => {
    const action = {
      type: ActionCreator.STATS_LOAD,
      data: statisticsApiResponseData,
    };
    const newState = Object.assign({}, initState, {
      data: statisticsApiResponseData,
      isFetching: false,
      isLoaded: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});
