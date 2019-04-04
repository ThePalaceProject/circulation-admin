import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import LibraryRegistrationForm from "../LibraryRegistrationForm";
import { Button } from "library-simplified-reusable-components";

describe("LibraryRegistrationForm", () => {
  let wrapper;
  let library = {
    name: "Test Library",
    status: "success",
    stage: "production",
    settings: {
      "terms-of-service": "terms_url"
    }
  };

  let libraryNoLink = { ...library, ...{ settings: [] }};
  let register = stub();

  beforeEach(() => {

    wrapper = mount(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText={"Update registration"}
        register={register}
        disabled={false}
      />
    );
  });

  it("displays a label and checkbox if there is a terms-of-service link", () => {
    let termsSection = wrapper.find(".registration-checkbox");
    expect(termsSection.length).to.equal(1);
    let label = termsSection.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("I have read and agree to the terms and conditions");
    let link = label.find("a");
    expect(link.length).to.equal(1);
    expect(link.prop("href")).to.equal("terms_url");
    let checkbox = wrapper.find("input");
    expect(checkbox.length).to.equal(1);
    expect(checkbox.prop("type")).to.equal("checkbox");
  });

  it("does not display a label and checkbox if there is no terms-of-service link", () => {
    wrapper.setProps({ library: libraryNoLink });
    expect(wrapper.find(".registration-checkbox").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("label").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("a").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("input").length).to.equal(0);
  });

  it("displays a registration button", () => {
    let button = wrapper.find("button");
    expect(button.text()).to.equal("Update registration");

    wrapper.setProps({ buttonText: "Register" });
    button = wrapper.find("button");
    expect(button.text()).to.equal("Register");

    wrapper.setProps({ buttonText: "Retry registration" });
    button = wrapper.find("button");
    expect(button.text()).to.equal("Retry registration");
  });

  it("disables the button if there is a checkbox and it is unchecked", () => {
    expect(wrapper.state()["checked"]).to.be.true;
    let button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.false;

    wrapper.setState({ checked: false });
    button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.true;
  });

  it("disables the button if the disabled prop is set to true, regardless of the checkbox", () => {
    expect(wrapper.state()["checked"]).to.be.true;
    wrapper.setProps({ disabled: true });
    let button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.true;

    wrapper.setProps({ library: libraryNoLink });
    button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.true;

    wrapper.setProps({ disabled: false });
    button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.false;
  });


  it("determines whether to pre-check the checkbox", () => {
    let checkbox = wrapper.find("input");
    expect(checkbox.prop("checked")).to.be.true;

    wrapper.setProps({ checked: false });
    checkbox = wrapper.find("input");
    expect(checkbox.prop("checked")).to.be.false;
  });

  it("calls register", () => {
    let button = wrapper.find("button");
    button.simulate("click");
    expect(register.callCount).to.equal(1);
    expect(register.args[0][0]).to.equal(library);

    wrapper.setProps({ disabled: true });
    button = wrapper.find("button");
    button.simulate("click");
    expect(register.callCount).to.equal(1);
  });
});
