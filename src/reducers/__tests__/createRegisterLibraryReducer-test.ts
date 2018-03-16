import { expect } from "chai";

import ActionCreator from "../../actions";
import createRegisterLibraryReducer, { RegisterLibraryState } from "../createRegisterLibraryReducer";

describe("register-library reducer", () => {
  let initState: RegisterLibraryState = {
    isFetching: false,
    fetchError: null
  };

  let errorState: RegisterLibraryState = {
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" }
  };

  let reducer = createRegisterLibraryReducer("TEST_REGISTER");

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles register library request", () => {
    let action = { type: `TEST_REGISTER_${ActionCreator.REQUEST}` };
    let newState = Object.assign({}, initState, { isFetching: true });
    expect(reducer(initState, action)).to.deep.equal(newState);
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles register library failure", () => {
    let action = { type: `TEST_REGISTER_${ActionCreator.FAILURE}`, error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, { fetchError: "test error", isFetching: false });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles register library success", () => {
    let action = { type: `TEST_REGISTER_${ActionCreator.SUCCESS}` };
    let oldState = Object.assign({}, initState, { isFetching: true, fetchError: "test error" });
    expect(reducer(oldState, action)).to.deep.equal(initState);
  });
});