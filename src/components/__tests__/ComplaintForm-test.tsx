jest.dontMock("../ComplaintForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import ComplaintForm from "../ComplaintForm";

describe("ComplaintForm", () => {
  describe("rendering", () => {
    let component;

    beforeEach(() => {
      component = TestUtils.renderIntoDocument(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
    });

    it("shows a select field with default value", () => {
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      expect(select.options[select.selectedIndex].innerHTML).toBe("select type");
    });

    it("shows complaint type options", () => {
      let options = TestUtils.scryRenderedDOMComponentsWithTag(component, "option");
      let types = options.map(option => option.getAttribute("value"));
      expect(types).toEqual([
        "",
        "cannot-issue-loan",
        "cannot-render",
        "wrong-title",
        "wrong-author",
        "wrong-audience",
        "cannot-fulfill-loan",
        "bad-description",
        "cannot-return",
        "bad-cover-image",
        "wrong-medium",
        "wrong-age-range",
        "wrong-genre"
      ]);
    });

    it("shows a submit button", () => {
      let button = TestUtils.findRenderedDOMComponentWithTag(component, "input");
    });

    it("disables", () => {
      component = TestUtils.renderIntoDocument(
        <ComplaintForm
          disabled={true}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let button = TestUtils.findRenderedDOMComponentWithTag(component, "input");
      expect(button.hasAttribute("disabled")).toBe(true);
    });
  });
});