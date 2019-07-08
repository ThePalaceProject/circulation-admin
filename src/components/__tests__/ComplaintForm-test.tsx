import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button, Form } from "library-simplified-reusable-components";

import ComplaintForm from "../ComplaintForm";
import EditableInput from "../EditableInput";

describe("ComplaintForm", () => {
  describe("rendering", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={stub()}
          refreshComplaints={stub()}
        />
      );
    });

    it("shows a select field with default value", () => {
      let select = wrapper.find(EditableInput);
      expect(select.length).to.equal(1);
      expect(select.prop("disabled")).to.equal(false);
      let option = select.find("option").at(0);
      expect(option.text()).to.equal("Complaint type");
    });

    it("shows complaint type options", () => {
      let options = wrapper.find("option");
      let types = options.map(option => option.prop("value"));
      expect(types).to.deep.equal([
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

    it("formats complaint type options", () => {
      let options = wrapper.find("option");
      let types = options.map(option => option.text());
      expect(types).to.eql([
        "Complaint type",
        "Cannot issue loan",
        "Cannot render",
        "Wrong title",
        "Wrong author",
        "Wrong audience",
        "Cannot fulfill loan",
        "Bad description",
        "Cannot return",
        "Bad cover image",
        "Wrong medium",
        "Wrong age range",
        "Wrong genre"
      ]);
    });

    it("shows a submit button", () => {
      let button = wrapper.find(Button);
      expect(button.length).to.equal(1);
    });

    it("disables", () => {
      wrapper.setProps({ disabled: true });
      let button = wrapper.find(Button);
      expect(button.prop("disabled")).to.equal(true);
      let select = wrapper.find(EditableInput);
      expect(select.prop("disabled")).to.equal(true);
    });
  });

  describe("behavior", () => {
    let wrapper;
    let postComplaint;

    beforeEach(() => {
      postComplaint = stub().returns(new Promise((resolve, reject) => {
        resolve();
      }));
      wrapper = mount(
        <ComplaintForm
          disabled={false}
          complaintUrl="complaint url"
          postComplaint={postComplaint}
          refreshComplaints={stub()}
        />
      );
    });

    it("posts complaints", () => {
      let form = wrapper.find(Form);
      let select = wrapper.find("select").getDOMNode();
      select.value = "bad-description";
      form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));
      expect(postComplaint.callCount).to.equal(1);
      expect(postComplaint.args[0][0]).to.equal("complaint url");
      expect(postComplaint.args[0][1].type).to.equal("http://librarysimplified.org/terms/problem/bad-description");
    });

    it("refreshes complaints after post", (done) => {
      wrapper.setProps({ refreshComplaints: done });
      let form = wrapper.find(Form);
      let select = wrapper.find("select").getDOMNode();
      (select as any).value = "bad-description";
      form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));
    });

    it("clears form after post", (done) => {
      wrapper.instance().clear = done;
      let form = wrapper.find(Form);
      let select = wrapper.find("select").getDOMNode();
      (select as any).value = "bad-description";
      form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));
    });

    it("displays error if no type is selected", () => {
      let form = wrapper.find(Form);
      form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));
      wrapper.update();
      let errors = wrapper.find(".alert-danger");
      expect(errors.length).to.equal(1);
      expect(errors.at(0).text()).to.equal("You must select a complaint type!");
    });

    it("calls showPostError() if post fails", (done) => {
      postComplaint = stub().returns(new Promise((resolve, reject) => {
        reject();
      }));
      wrapper.setProps({ postComplaint });
      (wrapper.instance() as ComplaintForm).showPostError = done;
      let form = wrapper.find(Form);
      let select = wrapper.find("select").getDOMNode();
      (select as any).value = "bad-description";
      form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));
    });

    it("clears complaint type", () => {
      let select = wrapper.find("select").getDOMNode();
      (select as any).value = "bad-description";
      wrapper.instance().clear();
      select = wrapper.find("select").getDOMNode();
      expect(select.value).to.equal("");
    });

    it("shows post error", () => {
      wrapper.setState({ errors: ["test error"] });
      wrapper.update();
      let errors = wrapper.find(".alert-danger");
      expect(errors.length).to.equal(1);
      expect(errors.at(0).text()).to.equal("test error");
    });
  });
});
