import { expect } from "chai";

import ManagePatrons from "../managePatrons";
import ActionCreator from "../../actions";

describe("ManagePatrons reducer", () => {
  let initState = {
    data: null,
    isFetching: false,
    isEditing: false,
    fetchError: null,
    formError: null,
    responseBody: null,
    successMessage: null,
    isLoaded: false,
  };

  it("returns initial state for unrecognized action", () => {
    expect(ManagePatrons(undefined, {})).to.deep.equal(initState);
  });

  it("handles CLEAR_PATRON_DATA_LOAD", () => {
    let action = {
      type: `${ActionCreator.CLEAR_PATRON_DATA}_LOAD`,
      data: null,
    };
    let oldPatronState = {
      url: "test url",
      data: {
        authorization_expires: "",
        authorization_identifier: "1234",
        authorization_identifiers: [],
        block_reason: "",
        external_type: "",
        fines: "",
        permanent_id: "1234",
      },
      isFetching: true,
      fetchError: null,
      editError: null,
      isLoaded: true,
      isEditing: false,
    };
    let oldErrorState = {
      url: "test url",
      data: null,
      isFetching: true,
      fetchError: {
        status: 400,
        response: "No patron found",
        url: "",
      },
      editError: null,
      isLoaded: true,
      isEditing: false,
    };

    let newPatronState = Object.assign({}, oldPatronState, {
      data: null,
      isFetching: false,
      isLoaded: true,
    });
    let newErrorState = Object.assign({}, oldErrorState, {
      data: null,
      isFetching: false,
      isLoaded: true,
      fetchError: null,
    });

    expect(ManagePatrons(oldPatronState, action)).to.deep.equal(newPatronState);
    expect(ManagePatrons(oldErrorState, action)).to.deep.equal(newErrorState);
  });
});
