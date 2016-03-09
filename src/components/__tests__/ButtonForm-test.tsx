jest.dontMock("../ButtonForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ButtonForm from "../ButtonForm";

describe("ButtonForm", () => {
  let buttonForm;
  let fetchMock;

  beforeEach(() => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm label={"label"} link={"link"} csrfToken={"token"} refresh={jest.genMockFunction()} />
    );
    fetchMock = jest.genMockFunction();
    fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
      resolve({ status: 200 });
    }));
    fetch = fetchMock;
  });

  it("shows label", () => {
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "input");
    expect(button.getAttribute("value")).toEqual("label");
  });

  it("hits provided link", () => {
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "input");
    TestUtils.Simulate.click(button);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("link");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("refreshes", (done) => {
    let refresh = () => {
      done();
    }

    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm label={"label"} link={"link"} csrfToken={"token"} refresh={refresh} />
    );

    let button = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "input");
    TestUtils.Simulate.click(button);
  });
});