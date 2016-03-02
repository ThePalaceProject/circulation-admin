jest.dontMock("../SuppressForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import SuppressForm from "../SuppressForm";

describe("SuppressForm", () => {
  let suppressForm;
  let fetchMock;

  beforeEach(() => {
    suppressForm = TestUtils.renderIntoDocument(
      <SuppressForm book={{title: "title"}} link={"link"} csrfToken={"token"} />
    );
    fetchMock = jest.genMockFunction();
    fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {}));
    fetch = fetchMock;
  });

  it("shows title", () => {
    let form = TestUtils.findRenderedDOMComponentWithTag(suppressForm, "form");
    expect(form.textContent).toContain("title");
  });

  it("hits suppress link", () => {
    let button = TestUtils.findRenderedDOMComponentWithTag(suppressForm, "input");
    TestUtils.Simulate.click(button);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("link");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });
});