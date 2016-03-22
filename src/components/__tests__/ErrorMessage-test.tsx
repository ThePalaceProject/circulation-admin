jest.dontMock("../ErrorMessage");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ErrorMessage from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("shows logged out message for 401 error", () => {
    let error = {
      status: 401,
      response: "",
      url: ""
    };
    let message = TestUtils.renderIntoDocument(
      <ErrorMessage error={error} />
    );
    let alert = TestUtils.findRenderedDOMComponentWithClass(message, "alert-danger");
    expect(alert.textContent).toContain("logged out");
  });

  it("shows detail for problem detail", () => {
    let error = {
      status: 500,
      response: JSON.stringify({status: 500, detail: "detail"}),
      url: ""
    };
    let message = TestUtils.renderIntoDocument(
      <ErrorMessage error={error} />
    );
    let alert = TestUtils.findRenderedDOMComponentWithClass(message, "alert-danger");
    expect(alert.textContent).toContain("detail");
  });

  it("shows response for non-json response", () => {
    let error = {
      status: 500,
      response: "response",
      url: ""
    };
    let message = TestUtils.renderIntoDocument(
      <ErrorMessage error={error} />
    );
    let alert = TestUtils.findRenderedDOMComponentWithClass(message, "alert-danger");
    expect(alert.textContent).toContain("response");
  });

  it("shows try again button", () => {
    let error = {
      status: 500,
      response: "response",
      url: ""
    };
    let tryAgain = jest.genMockFunction();
    let message = TestUtils.renderIntoDocument(
      <ErrorMessage error={error} tryAgain={tryAgain} />
    );
    let tryAgainLink = TestUtils.findRenderedDOMComponentWithTag(message, "a");
    expect(tryAgainLink.textContent).toContain("Try again");
    TestUtils.Simulate.click(tryAgainLink);
    expect(tryAgain.mock.calls.length).toEqual(1);
  });
});