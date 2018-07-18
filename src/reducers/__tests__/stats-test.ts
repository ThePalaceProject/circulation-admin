import { expect } from "chai";

import reducer, { StatsState } from "../stats";
import { StatsData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("stats reducer", () => {
  let statsData: StatsData = { NYPL: {
    patrons:  {
      total: 3456,
      with_active_loans: 55,
      with_active_loans_or_holds: 1234,
      loans: 100,
      holds: 2000
    },
    inventory: {
      titles: 54321,
      licenses: 123456,
      available_licenses: 100000
    },
    collections: {
      Overdrive: {
        licensed_titles: 500,
        open_access_titles: 10,
        licenses: 350,
        available_licenses: 100
      },
      Bibliotheca: {
        licensed_titles: 400,
        open_access_titles: 0,
        licenses: 300,
        available_licenses: 170
      },
      "Axis 360": {
        licensed_titles: 300,
        open_access_titles: 0,
        licenses: 280,
        available_licenses: 260
      },
      "Open Bookshelf" : {
        licensed_titles: 0,
        open_access_titles: 1200,
        licenses: 0,
        available_licenses: 0
      }
    }
  }};

  let initState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles STATS_REQUEST", () => {
    let action = { type: ActionCreator.STATS_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles STATS_FAILURE", () => {
    let action = { type: ActionCreator.STATS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles STATS_LOAD", () => {
    let action = { type: ActionCreator.STATS_LOAD, data: statsData };
    let newState = Object.assign({}, initState, {
      data: statsData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});