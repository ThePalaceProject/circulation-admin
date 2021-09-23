import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import SelfTestResult from "../SelfTestResult";

const stringResult = {
  duration: 0,
  end: "",
  name: "Test Result",
  result: "abc",
  start: "",
  success: true,
};

describe("SelfTestResult", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <SelfTestResult result={stringResult} isFetching={false} />
    );
  });
  it("displays a result with a string", () => {
    expect(wrapper.render().hasClass("success")).to.be.true;

    const testName = wrapper.find("h4");
    expect(testName.length).to.equal(1);
    expect(testName.text()).to.equal("Test Result");

    const testResult = wrapper.find("pre");
    expect(testResult.length).to.equal(1);
    expect(testResult.hasClass("result-description")).to.be.true;
    expect(testResult.text()).to.equal("abc");

    const testSuccess = wrapper.find("p");
    expect(testSuccess.length).to.equal(1);
    expect(testSuccess.hasClass("success-description")).to.be.true;
    expect(testSuccess.text()).to.equal("success: true");

    const collapsible = wrapper.find(".collapsible");
    expect(collapsible.length).to.equal(0);
  });

  it("displays a result with a multi-line string", () => {
    const longStringResult = { ...stringResult, ...{ result: "abc \n def" } };
    wrapper.setProps({ result: longStringResult });

    const collapsible = wrapper.find(".panel");
    expect(collapsible.length).to.equal(1);
    expect(collapsible.hasClass("panel-success")).to.be.true;
    expect(collapsible.find("span").at(0).text()).to.equal("Results");

    expect(wrapper.find("pre").text()).to.equal("abc \n def");
  });

  it("displays a result with an array", () => {
    const arrayResult = {
      ...stringResult,
      ...{ result: ["Thing 1", "Thing 2"] },
    };
    wrapper.setProps({ result: arrayResult });

    const collapsible = wrapper.find(".panel");
    expect(collapsible.length).to.equal(1);
    expect(collapsible.hasClass("panel-success")).to.be.true;
    expect(collapsible.find("span").at(0).text()).to.equal("Results (2)");

    const list = collapsible.find("ol");
    expect(list.length).to.equal(1);
    const items = list.find("li");
    expect(items.length).to.equal(2);
    expect(items.at(0).text()).to.equal("Thing 1");
    expect(items.at(1).text()).to.equal("Thing 2");
  });

  it("displays a result with an empty array", () => {
    const emptyArrayResult = { ...stringResult, ...{ result: [] } };
    wrapper.setProps({ result: emptyArrayResult });
    expect(wrapper.find(".collapsible").length).to.equal(0);
    const warning = wrapper.find(".warning");
    expect(warning.length).to.equal(1);
    expect(warning.text()).to.equal(
      "The test ran successfully, but no results were found."
    );
  });

  it("displays a result with an exception", () => {
    const exception = {
      class: "IntegrationException",
      debug_message: "debug message...",
      message: "Problem!",
    };
    const exceptionResult = {
      ...stringResult,
      ...{ success: false, exception: exception },
    };
    wrapper.setProps({ result: exceptionResult });

    expect(wrapper.render().hasClass("failure")).to.be.true;
    expect(wrapper.find(".success-description").text()).to.equal(
      "success: false"
    );
    const testException = wrapper.find(".exception-description");
    expect(testException.length).to.equal(1);
    expect(testException.text()).to.equal("exception: Problem!");
  });
});
