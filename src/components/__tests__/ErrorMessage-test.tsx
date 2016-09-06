import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import ErrorMessage from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("shows logged out message for 401 error", () => {
    let error = {
      status: 401,
      response: "",
      url: ""
    };
    let wrapper = mount(
      <ErrorMessage error={error} />
    );
    let alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("logged out");
  });

  it("shows detail for problem detail", () => {
    let error = {
      status: 500,
      response: JSON.stringify({status: 500, detail: "detail"}),
      url: ""
    };
    let wrapper = mount(
      <ErrorMessage error={error} />
    );
    let alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("detail");
  });

  it("shows response for non-json response", () => {
    let error = {
      status: 500,
      response: "response",
      url: ""
    };
    let wrapper = mount(
      <ErrorMessage error={error} />
    );
    let alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("response");
  });

  it("shows try again button", () => {
    let error = {
      status: 500,
      response: "response",
      url: ""
    };
    let tryAgain = stub();
    let wrapper = mount(
      <ErrorMessage error={error} tryAgain={tryAgain} />
    );
    let tryAgainLink = wrapper.find("a");
    expect(tryAgainLink.text()).to.contain("Try again");
    tryAgainLink.simulate("click");
    expect(tryAgain.callCount).to.equal(1);
  });
});