import { expect } from "chai";

import reducer, { StatsState } from "../stats";
import { StatsData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("stats reducer", () => {
  const statsData: StatsData = {
    Palace: {
      collections: {
        BiblioBoard: {
          available_licenses: 13306,
          enumerated_license_titles: 13306,
          lendable_titles: 13306,
          licensed_titles: 13306,
          licenses: 13306,
          open_access_titles: 0,
          self_hosted_titles: 0,
          titles: 13306,
          unlimited_license_titles: 0,
        },
        Bibliotheca: {
          available_licenses: 72,
          enumerated_license_titles: 76,
          lendable_titles: 64,
          licensed_titles: 76,
          licenses: 85,
          open_access_titles: 0,
          self_hosted_titles: 0,
          titles: 76,
          unlimited_license_titles: 0,
        },
        "B&T Axis 360": {
          available_licenses: 135,
          enumerated_license_titles: 146,
          lendable_titles: 134,
          licensed_titles: 146,
          licenses: 147,
          open_access_titles: 0,
          self_hosted_titles: 0,
          titles: 146,
          unlimited_license_titles: 0,
        },
        OverDrive: {
          titles: 500,
          lendable_titles: 90,
          enumerated_license_titles: 490,
          unlimited_license_titles: 0,
          licensed_titles: 490,
          open_access_titles: 10,
          licenses: 350,
          available_licenses: 100,
          self_hosted_titles: 0,
        },
        "Palace Marketplace": {
          available_licenses: 75337,
          enumerated_license_titles: 7753,
          lendable_titles: 7750,
          licensed_titles: 7753,
          licenses: 305725,
          open_access_titles: 0,
          self_hosted_titles: 0,
          titles: 7753,
          unlimited_license_titles: 0,
        },
        "Palace Bookshelf": {
          available_licenses: 0,
          enumerated_license_titles: 0,
          lendable_titles: 7838,
          licensed_titles: 0,
          licenses: 0,
          open_access_titles: 7838,
          self_hosted_titles: 0,
          titles: 7838,
          unlimited_license_titles: 0,
        },
      },
      inventory: {
        available_licenses: 88850,
        enumerated_license_titles: 21281,
        lendable_titles: 29092,
        licensed_titles: 21281,
        licenses: 319263,
        open_access_titles: 7838,
        self_hosted_titles: 0,
        titles: 29119,
        unlimited_license_titles: 0,
      },
      patrons: {
        holds: 5,
        loans: 0,
        total: 132,
        with_active_loans: 0,
        with_active_loans_or_holds: 4,
      },
    },
  };

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
    const action = { type: ActionCreator.STATS_LOAD, data: statsData };
    const newState = Object.assign({}, initState, {
      data: statsData,
      isFetching: false,
      isLoaded: true,
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});
