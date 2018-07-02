import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Complaints } from "../Complaints";
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
      id: "id",
      title: "test title",
      issuesLink: {
        href: "issues url",
        rel: "issues"
      }
    };

    beforeEach(() => {
      fetchComplaints = stub();
      postComplaint = stub();
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
          refreshCatalog={stub()}
          />
      );
    });

    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).to.equal("test title");
    });

    it("shows complaints", () => {
      let instance =  wrapper.instance() as any;
      let complaintsKeys = Object.keys(complaintsData);
      let types = wrapper.find(".complaint-type").map(type => type.text());
      let counts = wrapper.find(".complaint-count").map(count => parseInt(count.text()));
      expect(types).to.deep.equal(complaintsKeys.map(type => instance.readableComplaintType(type)));
      expect(counts).to.deep.equal(complaintsKeys.map(key => complaintsData[key]));
    });

    it("shows simplified complaint types", () => {
      let types = wrapper.find(".complaint-type").map(type => type.text());
      expect(types).to.deep.equal(["test type", "other type", "last type"]);
    });

    it("shows resolve button for each complaint type", () => {
      let buttons = wrapper.find(ButtonForm);
      expect(buttons.length).to.equal(Object.keys(complaintsData).length);
      buttons.forEach(button => {
        expect(button.props().disabled).not.to.be.ok;
        expect(button.props().label).to.equal("Resolve");
      });
    });

    it("shows complaint form", () => {
      let form = wrapper.find(ComplaintForm);
      expect(form.props().disabled).not.to.be.ok;
      expect(form.props().complaintUrl).to.equal(bookData.issuesLink.href);
      expect(form.props().postComplaint).to.equal(postComplaint);
    });

    it("shows fetch error", () => {
      let fetchComplaints = stub();
      let fetchError = { status: 401, response: "test", url: "test url" };
      let wrapper = shallow(
        <Complaints
          csrfToken="token"
          bookUrl="book url"
          book={{ id: "id", title: "test book" }}
          fetchError={fetchError}
          fetchComplaints={fetchComplaints}
          postComplaint={stub()}
          refreshCatalog={stub()}
          />
      );
      let complaintsUrl = (wrapper.instance() as any).complaintsUrl();

      let error = wrapper.find(ErrorMessage);
      expect(error.prop("error")).to.equal(fetchError);

      error.prop("tryAgain")();
      expect(fetchComplaints.callCount).to.equal(2);
      expect(fetchComplaints.args[1][0]).to.equal(complaintsUrl);
    });
  });

  describe("behavior", () => {
    let wrapper;
    let instance;
    let fetchComplaints, resolveComplaints, refreshCatalog;
    let complaintsData = {
      "http://librarysimplified.org/terms/problem/test-type": 2
    };
    let confirmStub;

    beforeEach(() => {
      confirmStub = stub(window, "confirm").returns(true);
      refreshCatalog = stub();
      fetchComplaints = stub();
      resolveComplaints = stub().returns(new Promise((resolve, reject) => {
        resolve();
      }));
      wrapper = mount(
        <Complaints
          csrfToken="token"
          book={{ id: "id", title: "test book" }}
          bookUrl="http://example.com/works/fakeid"
          complaints={complaintsData}
          fetchComplaints={fetchComplaints}
          refreshCatalog={refreshCatalog}
          resolveComplaints={resolveComplaints}
          />
      );
      instance = (wrapper.instance() as any);
    });

    afterEach(() => {
      confirmStub.restore();
    });

    it("fetches complaints on mount", () => {
      let complaintsUrl = instance.complaintsUrl();
      expect(fetchComplaints.callCount).to.equal(1);
      expect(fetchComplaints.args[0][0]).to.equal(complaintsUrl);
    });

    it("should call resolve()", () => {
      instance.resolve = stub();

      let resolveUrl = (wrapper.instance() as any).resolveComplaintsUrl();
      let input = wrapper.find(ButtonForm);
      input.simulate("click");

      expect(instance.resolve.callCount).to.equal(1);
      expect(instance.resolve.args[0][0]).to.equal(Object.keys(complaintsData)[0]);
    });

    it("should fetch and refresh Catalog when resolve() is called", (done) => {
      let resolveUrl = instance.resolveComplaintsUrl();
      instance.resolve("wrong-author").then(() => {
        expect(resolveComplaints.callCount).to.equal(1);
        expect(resolveComplaints.args[0][0]).to.equal(resolveUrl);
        expect(fetchComplaints.callCount).to.equal(2); // it also fetched on mount
        expect(refreshCatalog.callCount).to.equal(1);
        done();
      });
    });
  });
});
