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
        book={{ title: "test book" }}
        bookUrl="http://example.com/works/fakeid"
        fetchComplaints={fetchComplaints}
        postComplaint={jest.genMockFunction()}
        />
    );

    expect(fetchComplaints.mock.calls.length).toBe(1);
    expect(fetchComplaints.mock.calls[0][0]).toBe(complaints.complaintsUrl());
  });

  describe("rendering", () => {
    let fetchComplaints;
    let complaintsData;
    let complaints;

    beforeEach(() => {
      fetchComplaints = jest.genMockFunction();
      complaintsData = {
        "http://librarysimplified.org/terms/problem/test-type": 5,
        "http://librarysimplified.org/terms/problem/other-type": 3,
        "http://librarysimplified.org/terms/problem/last-type": 1
      };
      complaints = TestUtils.renderIntoDocument<Complaints>(
        <Complaints
          bookUrl="book url"
          book={{ title: "test title" }}
          complaints={complaintsData}
          fetchComplaints={fetchComplaints}
          postComplaint={jest.genMockFunction()}
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

    it("shows simplified complaint types", () => {
      let types = TestUtils.scryRenderedDOMComponentsWithClass(complaints, "complaintType").map(type => type.textContent);
      expect(types).toEqual(["test type", "other type", "last type"]);
    });
  });

  it("shows fetch error", () => {
    let fetchComplaints = jest.genMockFunction();
    let fetchError = { status: 401, response: "test", url: "test url" };
    let complaints = TestUtils.renderIntoDocument<Complaints>(
      <Complaints
        bookUrl="book url"
        book={{ title: "test book" }}
        fetchError={fetchError}
        fetchComplaints={fetchComplaints}
        postComplaint={jest.genMockFunction}
        />
    );

    let error = TestUtils.findRenderedComponentWithType(complaints, ErrorMessage);
    expect(error.props.error).toEqual(fetchError);

    error.props.tryAgain();
    expect(fetchComplaints.mock.calls.length).toBe(2);
    expect(fetchComplaints.mock.calls[1][0]).toBe(complaints.complaintsUrl());
  });
});