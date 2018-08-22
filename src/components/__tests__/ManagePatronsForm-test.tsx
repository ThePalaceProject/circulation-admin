import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";

import { mapDispatchToProps } from "../ManagePatronsForm";
import { ManagePatronsForm } from "../ManagePatronsForm";
import EditableInput from "../EditableInput";
import ErrorMessage from "../ErrorMessage";
import { Alert } from "react-bootstrap";

import ActionCreator from "../../actions";

describe("ManagePatronsForm", () => {

  let wrapper;
  let store;

  describe("rendering", () => {

    beforeEach(() => {
      store = buildStore();
      wrapper = mount(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
        />
      );
    });

    it("has .manage-patrons-form class", () => {
      expect(wrapper.hasClass("manage-patrons-form")).to.equal(true);
    });

    it("shows EditableInput", () => {
      let editableInput = wrapper.find(EditableInput);
      expect(editableInput.length).to.equal(1);
    });

    it("has a form with an input field and a button", () => {
      let form = wrapper.find("form");
      let input = wrapper.find("form input");
      let button = wrapper.find("form button");
      expect(form.length).to.equal(1);
      expect(input.length).to.equal(1);
      expect(button.length).to.equal(1);
    });

    it("doesn't initially show an alert or error message", () => {
      let alert = wrapper.find(Alert);
      let errorMessage = wrapper.find(ErrorMessage);
      expect(alert.length).to.equal(0);
      expect(errorMessage.length).to.equal(0);
    });

  });

  describe("behavior", () => {
    let dispatchProps;
    let patronLookup;
    let dispatch;

    beforeEach(() => {
      patronLookup = stub().returns(new Promise<void>(resolve => resolve()));
      dispatch = stub();
      dispatchProps = {
        patronLookup
      };
      store = buildStore();
      wrapper = mount(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
          patronLookup={patronLookup}
        />
      );
    });

    it("calls patronLookup on dispatch", async () => {
      const form = wrapper.find("form");
      expect(patronLookup.callCount).to.equal(0);
      form.simulate("submit");
      expect(patronLookup.callCount).to.equal(1);
    });

    it("displays an error message if the status is not 200", () => {
      let errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(0);

      wrapper.setState({ error: {status: 400, response: "", url: ""} });

      errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(1);
    });

  });

});
