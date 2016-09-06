import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import EditForm from "../EditForm";
import EditableInput from "../EditableInput";
import { BookData } from "../../interfaces";

describe("EditForm", () => {
  let bookData: BookData = {
    title: "title",
    subtitle: "subtitle",
    fiction: true,
    audience: "Young Adult",
    targetAgeRange: ["12", "16"],
    summary: "summary",
    series: "series",
    seriesPosition: "3",
    editLink: {
      href: "href",
      rel: "edit"
    }
  };

  describe("rendering", () => {
    let wrapper;
    let editableInputByName = (name) => {
      let inputs = wrapper.find(EditableInput);
      return inputs.filterWhere(input => input.props().name === name);
    };
    let editableInputByValue = (value) => {
      let inputs = wrapper.find(EditableInput);
      return inputs.filterWhere(input => input.props().value === value);
    };
    beforeEach(() => {
      wrapper = shallow(
        <EditForm
          {...bookData}
          csrfToken=""
          disabled={false}
          refresh={stub()}
          editBook={stub()}
          />
      );
    });

    it("shows editable input with title", () => {
      let input = editableInputByName("title");
      expect(input.props().label).to.equal("Title");
      expect(input.props().value).to.equal("title");
    });

    it("shows editable input with subtitle", () => {
      let input = editableInputByName("subtitle");
      expect(input.props().label).to.equal("Subtitle");
      expect(input.props().value).to.equal("subtitle");
    });

    it("shows editable input with series", () => {
      let input = editableInputByName("series");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("series");
    });

    it("shows editable input with series position", () => {
      let input = editableInputByName("series_position");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("3");
    });

    it("shows editable textarea with summary", () => {
      let textarea = editableInputByName("summary");
      expect(textarea.prop("label")).to.equal("Summary");
      expect(textarea.prop("value")).to.equal("summary");
    });
  });

  it("calls editBook on submit", () => {
    class MockFormData {
      data: any;
      constructor(form) {
        this.data = {};
        let elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
          let element = elements[i];
          this.data[element.name] = element.value;
        }
      }

      get(key) {
        return { value: this.data[key] };
      }
    }

    let formDataStub = stub(window, "FormData", MockFormData);

    let editBook = stub().returns(new Promise((resolve, reject) => {
      resolve();
    }));
    let wrapper = mount(
      <EditForm
        {...bookData}
        csrfToken="token"
        disabled={false}
        refresh={stub()}
        editBook={editBook}
        />
    );

    let form = wrapper.find("form");
    form.simulate("submit");
    formDataStub.restore();

    expect(editBook.callCount).to.equal(1);
    expect(editBook.args[0][0]).to.equal("href");
    expect(editBook.args[0][1].get("csrf_token").value).to.equal("token");
    expect(editBook.args[0][1].get("title").value).to.equal(bookData.title);
    expect(editBook.args[0][1].get("subtitle").value).to.equal(bookData.subtitle);
    expect(editBook.args[0][1].get("series").value).to.equal(bookData.series);
    expect(editBook.args[0][1].get("series_position").value).to.equal(bookData.seriesPosition);
    expect(editBook.args[0][1].get("summary").value).to.equal(bookData.summary);
  });

  it("refreshes book after editing", (done) => {
    let editBook = stub().returns(new Promise((resolve, reject) => {
      resolve();
    }));
    let wrapper = mount(
      <EditForm
        {...bookData}
        csrfToken=""
        disabled={false}
        refresh={done}
        editBook={editBook}
        />
    );

    let form = wrapper.find("form");
    form.simulate("submit");
  });

  it("disables all inputs", () => {
    let wrapper = shallow(
      <EditForm
        {...bookData}
        csrfToken=""
        disabled={true}
        refresh={stub()}
        editBook={stub()}
        />
    );
    let inputs = wrapper.find(EditableInput);
    inputs.forEach(input => {
      expect(input.prop("disabled")).to.equal(true);
    });
  });
});