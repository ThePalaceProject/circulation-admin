import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";

import ResetAdobeId from "../ResetAdobeId";
import EditableInput from "../EditableInput";
import { Alert } from "react-bootstrap";

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
      expect(header.text()).to.equal("Reset Adobe Id");
    });

    it("doesn't have a .patron-info section", () => {
      let patronInfo = wrapper.find(".patron-info");
      expect(patronInfo.length).to.equal(0);
    });
  });

  describe("rendering with patron", () => {
    let patron = {
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
    };

    beforeEach(() => {
      store = buildStore();
      wrapper = mount(
        <ResetAdobeId
          store={store}
          csrfToken="token"
          patron={patron}
        />
      );
    });

  });

});
