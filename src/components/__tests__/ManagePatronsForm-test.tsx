import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";

import { mapDispatchToProps } from "../ManagePatronsForm";
import ManagePatronsForm from "../ManagePatronsForm";
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
      patronLookup = stub().returns(new Promise(resolve => resolve()));
      dispatch = stub();
      dispatchProps = {
        patronLookup
      };
      store = buildStore();
      wrapper = mount(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
          {...dispatchProps}
        />
      );
    });

    it("calls patronLookup on dispatch", async () => {
      const data = new (window as any).FormData();
      let actions = new ActionCreator(null, "token");
      mapDispatchToProps(dispatch, {}).patronLookup(data);
      expect(dispatch.callCount).to.equal(1);
      // expect(dispatch.args[0][0]).to.eql(actions.patronLookup(data));
    });

    it.only("displays an error message if the status is not 200", () => {
      wrapper = shallow(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
        />
      );
      let errorMessage = wrapper.find(ErrorMessage);
      wrapper.setState({ error: {status: 400, response: "", url: ""} });
      errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(1);
    });

  });

});
