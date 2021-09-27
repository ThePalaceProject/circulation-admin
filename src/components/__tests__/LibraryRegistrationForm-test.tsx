import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import LibraryRegistrationForm from "../LibraryRegistrationForm";
import { Button } from "library-simplified-reusable-components";

describe("LibraryRegistrationForm", () => {
  let wrapper;
  const library = {
    name: "Test Library",
    status: "success",
    stage: "production",
  };
  const registrationData = {
    id: 1,
    libraries: [library],
    access_problem: null,
    terms_of_service_html:
      "Here are the <a href='terms.html'>terms of service</a>!",
    terms_of_service_link: "terms.html",
  };
  const register = stub();

  beforeEach(() => {
    wrapper = mount(
      <LibraryRegistrationForm
        library={library}
        checked={true}
        buttonText={"Update registration"}
        register={register}
        disabled={false}
        registrationData={registrationData}
      />
    );
  });

  it("does not display a label and checkbox if there is no terms-of-service data", () => {
    wrapper.setProps({ registrationData: null });
    expect(wrapper.find(".registration-checkbox").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("label").length).to.equal(
      0
    );
    expect(wrapper.find(".registration-status").find("a").length).to.equal(0);
    expect(wrapper.find(".registration-status").find("input").length).to.equal(
      0
    );
  });

  it("displays an error message if there is a problem with the terms-of-service data", () => {
    const dataWithProblem = {
      ...registrationData,
      ...{ access_problem: { detail: "Something went wrong." } },
    };
    wrapper.setProps({ registrationData: dataWithProblem });
    expect(
      wrapper.find(".registration-checkbox").find(".bg-danger").text()
    ).to.equal("Something went wrong.");
    // If the terms can't be displayed, there's no point showing the checkbox and button.
    expect(wrapper.find(".registration-status").find("input").length).to.equal(
      0
    );
    expect(wrapper.find(".registration-status").find("button").length).to.equal(
      0
    );
  });

  it("displays content and a checkbox with a label if there is terms-of-service HTML", () => {
    const termsSection = wrapper.find(".registration-checkbox");
    expect(termsSection.length).to.equal(1);
    const content = termsSection.find("p");
    expect(content.length).to.equal(1);
    expect(content.text()).to.equal("Here are the terms of service!");
    const label = wrapper.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("I agree to the terms of service.");
    const checkbox = wrapper.find("input");
    expect(checkbox.length).to.equal(1);
    expect(checkbox.prop("type")).to.equal("checkbox");
  });

  it("displays content and a checkbox with a label if there is a terms-of-service link", () => {
    wrapper.setProps({
      registrationData: {
        ...registrationData,
        ...{ terms_of_service_html: null },
      },
    });
    const termsSection = wrapper.find(".registration-checkbox");
    expect(termsSection.length).to.equal(1);
    const content = termsSection.find("p");
    expect(content.length).to.equal(1);
    expect(content.text()).to.equal(
      "You must read the terms of service before registering your library."
    );
    const link = wrapper.find("a");
    expect(link.length).to.equal(1);
    expect(link.prop("href")).to.equal("terms.html");
    const label = wrapper.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("I agree to the terms of service.");
    const checkbox = wrapper.find("input");
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
