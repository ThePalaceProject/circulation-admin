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
    stage: "production"
  };
  let registrationDataWithHTML = {
    id: 1,
    libraries: [library],
    access_problem: null,
    terms_of_service_html: "Here are the <a href='terms.html'>terms of service</a>!",
    terms_of_service_link: "terms.html"
  };
  let register = stub();

  beforeEach(() => {

    wrapper = mount(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText={"Update registration"}
        register={register}
        disabled={false}
        registrationData={registrationDataWithHTML}
      />
    );
  });

  it("does not display a label and checkbox if there is no terms-of-service data", () => {
    wrapper.setProps({ registrationData: null });
    expect(wrapper.find(".registration-checkbox").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("label").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("a").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("input").length).to.equal(0);
  });

  it("displays a label and checkbox if there is terms-of-service HTML", () => {
    let termsSection = wrapper.find(".registration-checkbox");
    expect(termsSection.length).to.equal(1);
    let label = termsSection.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("Here are the terms of service!");
    let checkbox = wrapper.find("input");
    expect(checkbox.length).to.equal(1);
    expect(checkbox.prop("type")).to.equal("checkbox");
  });

  it("displays a label and checkbox if there is a terms-of-service link", () => {
    wrapper.setProps({ registrationData: {...registrationDataWithHTML, ...{terms_of_service_html: null}} });
    let termsSection = wrapper.find(".registration-checkbox");
    expect(termsSection.length).to.equal(1);
    let label = termsSection.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("I have read and agree to the terms and conditions.");
    let link = wrapper.find("a");
    expect(link.length).to.equal(1);
    expect(link.prop("href")).to.equal("terms.html");
    let checkbox = wrapper.find("input");
    expect(checkbox.length).to.equal(1);
    expect(checkbox.prop("type")).to.equal("checkbox");
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
    expect(button.prop("disabled")).not.to.be.true;

    wrapper.setState({ checked: false });
    button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.true;
  });

  it("disables the button if the disabled prop is set to true, regardless of the checkbox", () => {
    expect(wrapper.state()["checked"]).to.be.true;
    wrapper.setProps({ disabled: true });
    let button = wrapper.find(Button);
    expect(button.prop("disabled")).to.be.true;

    wrapper.setProps({ disabled: false });
    button = wrapper.find(Button);
    expect(button.prop("disabled")).not.to.be.true;
  });


  it("determines whether to pre-check the checkbox", () => {
    let checkbox = wrapper.find("input");
    expect(checkbox.prop("checked")).to.be.true;

    wrapper.setProps({ checked: false });
    checkbox = wrapper.find("input");
    expect(checkbox.prop("checked")).not.to.be.true;
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
