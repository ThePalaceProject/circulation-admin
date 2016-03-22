jest.dontMock("../Complaints");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import ConnectedComplaints, { Complaints } from "../Complaints";
import ErrorMessage from "../ErrorMessage";

describe("Complaints", () => {
  it("fetches complaints", () => {
    let fetchComplaints = jest.genMockFunction();
    let complaints = TestUtils.renderIntoDocument<Complaints>(
      <Complaints
        book="http://example.com/works/fakeid"
        fetchComplaints={fetchComplaints}
        handleComplaintsUpdate={jest.genMockFunction()}
        />
    );

    expect(fetchComplaints.mock.calls.length).toBe(1);
    expect(fetchComplaints.mock.calls[0][0]).toBe(complaints.complaintsUrl());
  });

  describe("rendering", () => {
    let fetchComplaints;
    let handleComplaintsUpdate;
    let complaintsData;
    let complaints;

    beforeEach(() => {
      fetchComplaints = jest.genMockFunction();
      complaintsData = { "test-type": 5, "other-type": 3, "last-type": 1 };
      complaints = TestUtils.renderIntoDocument<Complaints>(
        <Complaints
          book="book url"
          bookData={{ title: "test title" }}
          complaints={complaintsData}
          fetchComplaints={fetchComplaints}
          handleComplaintsUpdate={jest.genMockFunction()}
          />
      );
    });

    it("shows book title", () => {
      let title = TestUtils.findRenderedDOMComponentWithTag(complaints, "h2");
      expect(title.textContent).toBe("test title");
    });

    it("shows complaints", () => {
      let types = TestUtils.scryRenderedDOMComponentsWithClass(complaints, "complaintType").map(type => type.textContent);
      let counts = TestUtils.scryRenderedDOMComponentsWithClass(complaints, "complaintCount").map(count => parseInt(count.textContent));
      expect(types).toEqual(Object.keys(complaintsData).map(type => complaints.readableComplaintType(type)));
      expect(counts).toEqual(Object.keys(complaintsData).map(key => complaintsData[key]));
    });
  });

  describe("updating", () => {
    it("handles complaints update", () => {
      let element = document.createElement("div");
      let handleComplaintsUpdate = jest.genMockFunction();
      let complaintsData = { "test-type": 5, "other-type": 3, "last-type": 1 };
      let newComplaintsData = { "some-type": 2 };
      ReactDOM.render(
        <Complaints
          book="book url"
          complaints={complaintsData}
          fetchComplaints={jest.genMockFunction()}
          handleComplaintsUpdate={handleComplaintsUpdate}
          />,
        element
      );
      ReactDOM.render(
        <Complaints
          book="book url"
          complaints={newComplaintsData}
          handleComplaintsUpdate={handleComplaintsUpdate}
          />,
        element
      );

      expect(handleComplaintsUpdate.mock.calls.length).toBe(1);
      expect(handleComplaintsUpdate.mock.calls[0][0]).toEqual(newComplaintsData);
    });
  });

  it("shows fetch error", () => {
    let fetchError = { status: 401, response: "test", url: "test url" };
    let complaints = TestUtils.renderIntoDocument<Complaints>(
      <Complaints
        book="book url"
        fetchError={fetchError}
        fetchComplaints={jest.genMockFunction()}
        handleComplaintsUpdate={jest.genMockFunction()}
        />
    );

    let error = TestUtils.findRenderedComponentWithType(complaints, ErrorMessage);
    expect(error.props.error).toEqual(fetchError);
  });
});
