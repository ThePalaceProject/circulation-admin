import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";

import { ResetAdobeId } from "../ResetAdobeId";
import EditableInput from "../EditableInput";
import { Alert } from "react-bootstrap";

let patrons = [
  {
    authorization_expires: "",
    username: "User Name",
    personal_name: "Personal Name",
    email_address: "user@email.com",
    authorization_identifier: "1234",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
  {
    authorization_expires: "",
    personal_name: "Personal Name2",
    authorization_identifier: "5678",
    authorization_identifiers: [""],
    block_reason: "",
    external_type: "",
    fines: "",
    permanent_id: "",
  },
];

describe("ResetAdobeId", () => {
  let store;
  let wrapper;

  describe("rendering without patron", () => {

    beforeEach(() => {
      store = buildStore();
      wrapper = mount(
        <ResetAdobeId
          store={store}
          csrfToken="token"
          patron={null}
        />
      );
    });

    it("has .patron-actions class", () => {
      expect(wrapper.hasClass("patron-actions")).to.equal(true);
    });

    it("has a header", () => {
      let header = wrapper.find("h4");
      expect(header.text()).to.equal("Reset Adobe ID");
    });

    it("doesn't have a .patron-info section", () => {
      let patronInfo = wrapper.find(".patron-info");
      expect(patronInfo.length).to.equal(0);
    });

    it("should display message to search for patron to begin", () => {
      let instructions = wrapper.find("p").at(1);
      expect(instructions.text()).to.equal("Search for a patron to begin.");
    });
  });

  describe("rendering with patron", () => {
    beforeEach(() => {
      store = buildStore();
      wrapper = mount(
        <ResetAdobeId
          store={store}
          csrfToken="token"
          patron={patrons[0]}
        />
      );
    });

    it("should display the patron's information", () => {
      const patronInfo = wrapper.find(".patron-info");
      const patronList = patronInfo.find("ul");
      const patronItemInfo = patronList.find("li");

      expect(patronList.length).to.equal(1);
      expect(patronItemInfo.length).to.equal(4);
      expect(patronItemInfo.at(0).text()).to.equal("Username:User Name");
      expect(patronItemInfo.at(1).text()).to.equal("Personal Name:Personal Name");
      expect(patronItemInfo.at(2).text()).to.equal("Email Address:user@email.com");
      expect(patronItemInfo.at(3).text()).to.equal("Identifier:1234");
    });

    it("should display a warning message before the submission button", () => {
      const patronWarning = wrapper.find(".patron-warning");

      expect(patronWarning.text()).to.equal("Patron User Name will lose any existing loans or reserves when the Adobe ID is reset.");
    });
  });

  describe("Behavior", () => {
    let resetAdobeId;

    beforeEach(() => {
      resetAdobeId = stub().returns(new Promise<void>(resolve => resolve()));
      store = buildStore();
      wrapper = mount(
        <ResetAdobeId
          store={store}
          csrfToken="token"
          patron={patrons[0]}
          resetAdobeId={resetAdobeId}
        />
      );
    });

    it("should have a disabled submit button", () => {
      const button = wrapper.find("button");

      expect(button.props().disabled).to.equal(true);
    });

    it("should enable the submit button when the checkbox is checked", () => {
      const input = wrapper.find("input");
      const button = wrapper.find("button");

      expect(wrapper.state().checked).to.equal(false);
      input.simulate("change");
      wrapper.update();

      expect(wrapper.state().checked).to.equal(true);
      expect(button.props().disabled).to.equal(false);
    });

    it("should reset the adobe ID when the button is clicked", () => {
      const data = new (window as any).FormData();
      data.append("identifier", patrons[0].authorization_identifier);
      const button = wrapper.find("button");
      wrapper.setState({ checked: true });

      button.simulate("click");

      expect(resetAdobeId.callCount).to.equal(1);
      expect(resetAdobeId.args[0][0]).to.eql(data);
    });

    it("should show a success alert message if the reset is successful", async () => {
      const button = wrapper.find("button");
      let alert = wrapper.find(Alert);

      // Manually setting the state `checked` attribute to true to enable
      // the button so it can be clicked.
      wrapper.setState({ checked: true });

      expect(wrapper.state().success).to.equal(false);
      expect(alert.length).to.equal(0);

      await button.simulate("click");

      alert = wrapper.find(Alert);
      expect(wrapper.state().success).to.equal(true);
      expect(alert.length).to.equal(1);
      expect(alert.hasClass("alert-success")).to.equal(true);
      expect(alert.text()).to.equal("Adobe ID for patron 1234 has been reset.");
    });

    it("should show a failure alert message if the reset fails", async () => {
      const error = { status: 400, response: "", url: "" };
      resetAdobeId = stub()
        .returns(new Promise<void>((resolve, reject) => reject(error)));
      wrapper = mount(
        <ResetAdobeId
          store={store}
          csrfToken="token"
          patron={patrons[0]}
          resetAdobeId={resetAdobeId}
        />
      );

      const button = wrapper.find("button");
      let alert = wrapper.find(Alert);

      expect(alert.length).to.equal(0);

      // Manually setting the state `checked` attribute to true to enable
      // the button so it can be clicked.
      wrapper.setState({ checked: true, error });

      // TODO: make this work
      // await button.simulate("click");

      alert = wrapper.find(Alert);
      expect(wrapper.state().success).to.equal(false);
      expect(wrapper.state().error).to.eql(error);
      expect(alert.length).to.equal(1);
      expect(alert.hasClass("alert-danger")).to.equal(true);
      expect(alert.text()).to.equal("Error: failed to reset Adobe ID for patron 1234");
    });

    it("should update the patron's information if a new patron was searched and found", () => {
      it("should display the patron's information", () => {
        const patronInfo = wrapper.find(".patron-info");
        const patronList = patronInfo.find("ul");
        const patronItemInfo = patronList.find("li");

        expect(patronList.length).to.equal(1);
        expect(patronItemInfo.length).to.equal(4);
        expect(patronItemInfo.at(0).text()).to.equal("UsernameUser Name");
        expect(patronItemInfo.at(1).text()).to.equal("Personal NamePersonal Name");
        expect(patronItemInfo.at(2).text()).to.equal("Email Addressuser@email.com");
        expect(patronItemInfo.at(3).text()).to.equal("Identifier1234");

        wrapper.setProps({ patron: patrons[1] });

        expect(patronList.length).to.equal(1);
        expect(patronItemInfo.length).to.equal(2);
        expect(patronItemInfo.at(0).text()).to.equal("Personal NamePersonal Name2");
        expect(patronItemInfo.at(1).text()).to.equal("Identifier5678");

        const patronWarning = wrapper.find(".patron-warning");

        expect(patronWarning.text()).to.equal("Patron  will lose any existing loans or reserves when the Adobe ID is reset.");
      });
    });
  });
});
