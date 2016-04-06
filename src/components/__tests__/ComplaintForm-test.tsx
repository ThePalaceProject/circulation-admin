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

  describe("posting", () => {
    it("calls postComplaint", () => {
      let postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      let component = TestUtils.renderIntoDocument(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let form = TestUtils.findRenderedDOMComponentWithTag(component, "form");
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      TestUtils.Simulate.submit(form);
      expect(postComplaint.mock.calls.length).toBe(1);
      expect(postComplaint.mock.calls[0][0]).toBe("complaint url");
      expect(postComplaint.mock.calls[0][1].type).toBe("http://librarysimplified.org/terms/problem/bad-description");
    });

    it("calls refreshComplaints", (done) => {
      let postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      let component = TestUtils.renderIntoDocument(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={done}
          />
      );
      let form = TestUtils.findRenderedDOMComponentWithTag(component, "form");
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      TestUtils.Simulate.submit(form);
    });

    it("resets form", (done) => {
      let postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      let component = TestUtils.renderIntoDocument<ComplaintForm>(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      component.resetForm = done;
      let form = TestUtils.findRenderedDOMComponentWithTag(component, "form");
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      TestUtils.Simulate.submit(form);
    });

    it("displays error if no type is selected", () => {
      let postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      let component = TestUtils.renderIntoDocument<ComplaintForm>(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let form = TestUtils.findRenderedDOMComponentWithTag(component, "form");
      TestUtils.Simulate.submit(form);
      let errors = TestUtils.scryRenderedDOMComponentsWithClass(component, "complaintFormError");
      expect(errors.length).toBe(1);
      expect(errors[0].textContent).toBe("You must select a complaint type!");
    });

    it("calls showPostError() if post fails", (done) => {
      let postComplaint = jest.genMockFunction();
      postComplaint.mockReturnValue(new Promise((resolve, reject) => {
        reject();
      }));
      let component = TestUtils.renderIntoDocument<ComplaintForm>(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      component.showPostError = done;
      let form = TestUtils.findRenderedDOMComponentWithTag(component, "form");
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      TestUtils.Simulate.submit(form);
    });
  });

  describe("resetForm", () => {
    it("resets complaint type", () => {
      let component = TestUtils.renderIntoDocument<ComplaintForm>(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      component.resetForm();
      expect(select.value).toBe("");
    });
  });

  describe("showPostError", () => {
    it("shows post error", () => {
      let component = TestUtils.renderIntoDocument<ComplaintForm>(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={jest.genMockFunction()}
          refreshComplaints={jest.genMockFunction()}
          />
      );
      let select = TestUtils.findRenderedDOMComponentWithTag(component, "select") as HTMLSelectElement;
      select.value = "bad-description";
      component.showPostError();
      let errors = TestUtils.scryRenderedDOMComponentsWithClass(component, "complaintFormError");
      expect(errors.length).toBe(1);
      expect(errors[0].textContent).toBe("Couldn't post complaint.");
      expect(select.value).toBe("bad-description");
    });
  });
});