import { expect } from "chai";

import reducer, { IndividualAdminsState } from "../individualAdmins";
import { IndividualAdminsData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("individual admins reducer", () => {
  let individualAdminsData: IndividualAdminsData = {
    individualAdmins: [{
      email: "test@nypl.org"
    }]
  };

  let initState: IndividualAdminsState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: IndividualAdminsState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles INDIVIDUAL_ADMINS_REQUEST", () => {
    let action = { type: ActionCreator.INDIVIDUAL_ADMINS_REQUEST, url: "test_url" };

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

  it("handles INDIVIDUAL_ADMINS_FAILURE", () => {
    let action = { type: ActionCreator.INDIVIDUAL_ADMINS_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles INDIVIDUAL_ADMINS_LOAD", () => {
    let action = { type: ActionCreator.INDIVIDUAL_ADMINS_LOAD, data: individualAdminsData };
    let newState = Object.assign({}, initState, {
      data: individualAdminsData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_INDIVIDUAL_ADMIN_REQUEST", () => {
    let action = { type: ActionCreator.EDIT_INDIVIDUAL_ADMIN_REQUEST, url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isEditing: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isEditing: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_INDIVIDUAL_ADMIN_FAILURE", () => {
    let action = { type: ActionCreator.EDIT_INDIVIDUAL_ADMIN_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_INDIVIDUAL_ADMIN_SUCCESS", () => {
    let action = { type: ActionCreator.EDIT_INDIVIDUAL_ADMIN_SUCCESS };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });
});
