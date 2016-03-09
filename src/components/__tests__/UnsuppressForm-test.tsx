jest.dontMock("../UnsuppressForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import UnsuppressForm from "../UnsuppressForm";

describe("UnsuppressForm", () => {
  let unsuppressForm;
  let fetchMock;

  beforeEach(() => {
    unsuppressForm = TestUtils.renderIntoDocument(
      <UnsuppressForm link={"link"} csrfToken={"token"} />
    );
    fetchMock = jest.genMockFunction();
    fetchMock.mockReturnValue(new Promise<any>((resolve, reject) => {}));
    fetch = fetchMock;
  });

  it("hits unsuppress link", () => {
    let button = TestUtils.findRenderedDOMComponentWithTag(unsuppressForm, "input");
    TestUtils.Simulate.click(button);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("link");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });
});