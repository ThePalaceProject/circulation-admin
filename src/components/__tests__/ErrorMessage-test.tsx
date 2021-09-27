import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import ErrorMessage from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("shows logged out message for 401 error", () => {
    const error = {
      status: 401,
      response: "",
      url: "",
    };
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("logged out");
  });

  it("shows detail for problem detail", () => {
    const error = {
      status: 500,
      response: JSON.stringify({ status: 500, detail: "detail" }),
      url: "",
    };
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("detail");
  });

  it("shows response for non-json response", () => {
    const error = {
      status: 500,
      response: "response",
      url: "",
    };
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    expect(alert.text()).to.contain("response");
  });

  it("parses non-JSON problem detail string", () => {
    // prettier-ignore
    const pd = "Remote service returned a problem detail document: {\"status\": 502, \"detail\": problem text, \"title\": TITLE}";
    const error = {
      status: 500,
      response: pd,
      url: "",
    };
    const message =
      "Remote service returned a problem detail document with status 502: problem text";
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    const title = wrapper.find("b");
    expect(alert.text()).to.contain(message);
    expect(title.text()).to.equal("TITLE");
  });

  it("can handle missing detail property in non-JSON problem detail string", () => {
    // prettier-ignore
    const pd = "Remote service returned a problem detail document: {\"status\": 502, \"title\": TITLE}";
    const error = {
      status: 500,
      response: pd,
      url: "",
    };
    const message =
      "Remote service returned a problem detail document with status 502: ";
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    const title = wrapper.find("b");
    expect(alert.text()).to.contain(message);
    expect(title.text()).to.equal("TITLE");
  });

  it("can handle missing status property in non-JSON problem detail string", () => {
    // prettier-ignore
    const pd = "Remote service returned a problem detail document:  {\"detail\": problem text, \"title\": TITLE}";
    const error = {
      status: 500,
      response: pd,
      url: "",
    };
    const message = "Remote service returned a problem detail document: ";
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    const title = wrapper.find("b");
    expect(alert.text()).to.contain(message);
    expect(title.text()).to.equal("TITLE");
  });

  it("can handle missing title property in non-JSON problem detail string", () => {
    // prettier-ignore
    const pd = "Remote service returned a problem detail document:  {\"status\": 502, \"detail\": problem text}";
    const error = {
      status: 500,
      response: pd,
      url: "",
    };
    const message =
      "Remote service returned a problem detail document with status 502: ";
    const wrapper = mount(<ErrorMessage error={error} />);
    const alert = wrapper.find(".alert-danger");
    const title = wrapper.find("b");
    expect(alert.text()).to.contain(message);
    expect(title.text()).to.equal("Error");
  });

  it("shows try again button", () => {
    const error = {
      status: 500,
      response: "response",
      url: "",
    };
    const tryAgain = stub();
    const wrapper = mount(<ErrorMessage error={error} tryAgain={tryAgain} />);
    const tryAgainLink = wrapper.find("button");
    expect(tryAgainLink.text()).to.contain("Try again");
    tryAgainLink.simulate("click");
    expect(tryAgain.callCount).to.equal(1);
  });
});
