jest.autoMockOff();

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
          refresh={jest.genMockFunction()}
          editBook={jest.genMockFunction()}
          />
      );
    });

    it("shows editable input with title", () => {
      let input = editableInputByName("title");
      expect(input.props().label).toBe("Title");
      expect(input.props().value).toBe("title");
    });

    it("shows editable input with subtitle", () => {
      let input = editableInputByName("subtitle");
      expect(input.props().label).toBe("Subtitle");
      expect(input.props().value).toBe("subtitle");
    });

    it("shows editable input with series", () => {
      let input = editableInputByName("series");
      expect(input.props().label).toBeFalsy();
      expect(input.props().value).toBe("series");
    });

    it("shows editable input with series position", () => {
      let input = editableInputByName("series_position");
      expect(input.props().label).toBeFalsy();
      expect(input.props().value).toBe("3");
    });

    it("shows editable textarea with summary", () => {
      let textarea = editableInputByName("summary");
      expect(textarea.prop("label")).toBe("Summary");
      expect(textarea.prop("value")).toBe("summary");
    });
  });

  it("calls editBook on submit", () => {
    let editBook = jest.genMockFunction();
    editBook.mockReturnValue(new Promise((resolve, reject) => {
      resolve();
    }));
    let wrapper = mount(
      <EditForm
        {...bookData}
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        editBook={editBook}
        />
    );

    let form = wrapper.find("form");
    form.simulate("submit");

    expect(editBook.mock.calls.length).toBe(1);
    expect(editBook.mock.calls[0][0]).toBe("href");
    expect(editBook.mock.calls[0][1].get("csrf_token").value).toBe("token");
    expect(editBook.mock.calls[0][1].get("title").value).toBe(bookData.title);
    expect(editBook.mock.calls[0][1].get("subtitle").value).toBe(bookData.subtitle);
    expect(editBook.mock.calls[0][1].get("series").value).toBe(bookData.series);
    expect(editBook.mock.calls[0][1].get("series_position").value).toBe(bookData.seriesPosition);
    expect(editBook.mock.calls[0][1].get("summary").value).toBe(bookData.summary);
  });

  it("refreshes book after editing", (done) => {
    let editBook = jest.genMockFunction();
    editBook.mockReturnValue(new Promise((resolve, reject) => {
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
        refresh={jest.genMockFunction()}
        editBook={jest.genMockFunction()}
        />
    );
    let inputs = wrapper.find(EditableInput);
    inputs.forEach(input => {
      expect(input.prop("disabled")).toBe(true);
    });
  });
});