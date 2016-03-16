jest.dontMock("../ButtonForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { ButtonInput } from "react-bootstrap";

import ButtonForm from "../ButtonForm";

describe("ButtonForm", () => {
  let buttonForm;
  let fetchMock;

  beforeEach(() => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label={"label"}
        link={"link"}
        csrfToken={"token"}
        disabled={false}
        refresh={jest.genMockFunction()}
        dispatchEdit={jest.genMockFunction()}
        />
    );
    fetchMock = jest.genMockFunction();
    fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {
      resolve({ status: 200 });
    }));
    fetch = fetchMock;
  });

  it("shows label", () => {
    let buttonComponent = TestUtils.findRenderedComponentWithType(buttonForm, ButtonInput);
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonComponent, "input");
    expect(button.getAttribute("value")).toEqual("label");
  });

  it("hits provided link", () => {
    let form = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "form");
    TestUtils.Simulate.submit(form);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("link");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("refreshes", (done) => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label={"label"}
        link={"link"}
        csrfToken={"token"} 
        disabled={false}
        refresh={done}
        dispatchEdit={jest.genMockFunction()}
        />
    );

    let form = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "form");
    TestUtils.Simulate.submit(form);
  });

  it("disables", () => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label={"label"}
        link={"link"}
        csrfToken={"token"} 
        disabled={true}
        refresh={jest.genMockFunction()}
        dispatchEdit={jest.genMockFunction()}
        />
    );

    let buttonComponent = TestUtils.findRenderedComponentWithType(buttonForm, ButtonInput);
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonComponent, "input");
    expect(button.hasAttribute("disabled")).toBeTruthy();
  });
});