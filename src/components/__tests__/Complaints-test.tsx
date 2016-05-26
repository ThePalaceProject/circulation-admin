jest.dontMock("../Complaints");
jest.dontMock("../ButtonForm");

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Complaints, ComplaintsProps } from "../Complaints";
import ErrorMessage from "../ErrorMessage";
import ButtonForm from "../ButtonForm";
import ComplaintForm from "../ComplaintForm";

describe("Complaints", () => {
  describe("rendering", () => {
    let fetchComplaints;
    let postComplaint;
    let complaintsData;
    let wrapper;
    let bookData = {
      title: "test title",
      issuesLink: {
        href: "issues url",
        rel: "issues"
      }
    }

    beforeEach(() => {

      fetchComplaints = jest.genMockFunction();
      postComplaint = jest.genMockFunction();
      complaintsData = {
        "http://librarysimplified.org/terms/problem/test-type": 5,
        "http://librarysimplified.org/terms/problem/other-type": 3,
        "http://librarysimplified.org/terms/problem/last-type": 1
      };
      wrapper = shallow(
        <Complaints
          csrfToken="token"
          bookUrl="book url"
          book={bookData}
          complaints={complaintsData}
          fetchComplaints={fetchComplaints}
          postComplaint={postComplaint}
          refreshCatalog={jest.genMockFunction()}
          />
      );
    });

    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).toBe("test title");
    });

    it("shows complaints", () => {
      let instance =  wrapper.instance() as any;
      let complaintsKeys = Object.keys(complaintsData)
      let types = wrapper.find(".complaintType").map(type => type.text());
      let counts = wrapper.find(".complaintCount").map(count => parseInt(count.text()));
      expect(types).toEqual(complaintsKeys.map(type => instance.readableComplaintType(type)));
      expect(counts).toEqual(complaintsKeys.map(key => complaintsData[key]));
    });

    it("shows simplified complaint types", () => {
      let types = wrapper.find(".complaintType").map(type => type.text());
      expect(types).toEqual(["test type", "other type", "last type"]);
    });

    it("shows resolve button for each complaint type", () => {
      let buttons = wrapper.find(ButtonForm);
      expect(buttons.length).toBe(Object.keys(complaintsData).length);
      buttons.forEach(button => {
        expect(button.props().disabled).toBeFalsy();
        expect(button.props().label).toBe("Resolve");
      });
    });

    it("shows complaint form", () => {
      let form = wrapper.find(ComplaintForm);
      expect(form.props().disabled).toBeFalsy();
      expect(form.props().complaintUrl).toBe(bookData.issuesLink.href);
      expect(form.props().postComplaint).toBe(postComplaint);
    });

    it("shows fetch error", () => {
      let fetchComplaints = jest.genMockFunction();
      let fetchError = { status: 401, response: "test", url: "test url" };
      let wrapper = shallow(
        <Complaints
          csrfToken="token"
          bookUrl="book url"
          book={{ title: "test book" }}
          fetchError={fetchError}
          fetchComplaints={fetchComplaints}
          postComplaint={jest.genMockFunction}
          refreshCatalog={jest.genMockFunction()}
          />
      );
      let complaintsUrl = (wrapper.instance() as any).complaintsUrl()

      let error = wrapper.find(ErrorMessage);
      expect(error.props().error).toEqual(fetchError);

      error.props().tryAgain();
      expect(fetchComplaints.mock.calls.length).toBe(2);
      expect(fetchComplaints.mock.calls[1][0]).toBe(complaintsUrl);
    });
  });

  describe("behavior", () => {
    let wrapper;
    let instance;
    let fetchComplaints, resolveComplaints, refreshCatalog;
    let complaintsData = {
      "http://librarysimplified.org/terms/problem/test-type": 2
    };

    beforeEach(() => {
      spyOn(window, "confirm").and.returnValue(true);
      refreshCatalog = jest.genMockFunction();
      fetchComplaints = jest.genMockFunction();
      resolveComplaints = jest.genMockFunction();
      resolveComplaints.mockReturnValue(new Promise((resolve, reject) => {
        resolve();
      }));
      wrapper = mount(
        <Complaints
          csrfToken="token"
          book={{ title: "test book" }}
          bookUrl="http://example.com/works/fakeid"
          complaints={complaintsData}
          fetchComplaints={fetchComplaints}
          refreshCatalog={refreshCatalog}
          resolveComplaints={resolveComplaints}
          />
      );
      instance = (wrapper.instance() as any);
    });

    it("fetches complaints on mount", () => {
      let complaintsUrl = instance.complaintsUrl();
      expect(fetchComplaints.mock.calls.length).toBe(1);
      expect(fetchComplaints.mock.calls[0][0]).toBe(complaintsUrl);
    });

    it("should call resolve()", () => {
      instance.resolve = jest.genMockFunction();

      let resolveUrl = (wrapper.instance() as any).resolveComplaintsUrl();
      let input = wrapper.find(ButtonForm);
      input.simulate("click");

      expect(instance.resolve.mock.calls.length).toBe(1);
      expect(instance.resolve.mock.calls[0][0]).toBe(Object.keys(complaintsData)[0]);
    });

    it("should fetch and refresh Catalog when resolve() is called", (done) => {
      let resolveUrl = instance.resolveComplaintsUrl();
      instance.resolve().then(() => {
        expect(resolveComplaints.mock.calls.length).toBe(1);
        expect(resolveComplaints.mock.calls[0][0]).toBe(resolveUrl);
        expect(fetchComplaints.mock.calls.length).toBe(2); // it also fetched on mount
        expect(refreshCatalog.mock.calls.length).toBe(1);
        done();
      });
    });
  });
});
