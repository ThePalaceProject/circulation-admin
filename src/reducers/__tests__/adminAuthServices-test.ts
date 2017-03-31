import { expect } from "chai";

import reducer, { AdminAuthServicesState } from "../adminAuthServices";
import { AdminAuthServicesData } from "../../interfaces";
import ActionCreator from "../../actions";

describe("admin auth services reducer", () => {
  let adminAuthServicesData: AdminAuthServicesData = {
    admin_auth_services: [{
      name: "abcd",
      provider: "OAuth provider",
      domains: [],
    }],
    providers: [
      "OAuth provider",
      "some other provider"
    ]
  };

  let initState: AdminAuthServicesState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: AdminAuthServicesState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: { status: 400, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles ADMIN_AUTH_SERVICES_REQUEST", () => {
    let action = { type: ActionCreator.ADMIN_AUTH_SERVICES_REQUEST, url: "test_url" };

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

  it("handles ADMIN_AUTH_SERVICES_FAILURE", () => {
    let action = { type: ActionCreator.ADMIN_AUTH_SERVICES_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles ADMIN_AUTH_SERVICES_LOAD", () => {
    let action = { type: ActionCreator.ADMIN_AUTH_SERVICES_LOAD, data: adminAuthServicesData };
    let newState = Object.assign({}, initState, {
      data: adminAuthServicesData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_ADMIN_AUTH_SERVICE_REQUEST", () => {
    let action = { type: ActionCreator.EDIT_ADMIN_AUTH_SERVICE_REQUEST, url: "test url" };

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

  it("handles EDIT_ADMIN_AUTH_SERVICE_FAILURE", () => {
    let action = { type: ActionCreator.EDIT_ADMIN_AUTH_SERVICE_FAILURE, error: "test error" };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles EDIT_ADMIN_AUTH_SERVICE_SUCCESS", () => {
    let action = { type: ActionCreator.EDIT_ADMIN_AUTH_SERVICE_SUCCESS };
    let oldState = Object.assign({}, initState, {
      isEditing: true
    });
    let newState = Object.assign({}, oldState, {
      isEditing: false
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });
});
