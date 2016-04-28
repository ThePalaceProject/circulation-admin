jest.dontMock("../EditForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { mount } from "enzyme";

import EditForm, { EditableInput } from "../EditForm";
import { Input, ButtonInput } from "react-bootstrap";

describe("EditableInput", () => {
  let editableInput;

  beforeEach(() => {
    editableInput = TestUtils.renderIntoDocument(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
  });

  it("shows label from props", () => {
    let input = TestUtils.findRenderedComponentWithType(editableInput, Input);
    expect(input.props.label).toEqual("label");
  });

  it("shows initial value from props", () => {
    expect(editableInput.state.value).toEqual("initial value");
    let input = TestUtils.findRenderedComponentWithType(editableInput, Input);
    expect(input.props.value).toEqual("initial value");
  });

  it("shows children from props", () => {
    editableInput = TestUtils.renderIntoDocument(
      <EditableInput
        type="select"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        >
        <option>option</option>
      </EditableInput>
    );
    let option = TestUtils.findRenderedDOMComponentWithTag(editableInput, "option")
    expect(option.textContent).toEqual("option");
  });

  it("updates state and value when props change", () => {
    let elem = document.createElement("div");
    let editableInput = ReactDOM.render(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />,
      elem
    );
    ReactDOM.render(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="new value"
        />,
      elem
    );
    expect(editableInput.state["value"]).toEqual("new value");
    let input = TestUtils.findRenderedComponentWithType(editableInput, Input);
    expect(input.props.value).toEqual("new value");
  });

  it("updates state when input changes", () => {
    let input = TestUtils.findRenderedDOMComponentWithTag(editableInput, "input");
    input["value"] = "new value";
    TestUtils.Simulate.change(input);
    expect(editableInput.state["value"]).toEqual("new value");
  });

  it("disables", () => {
    editableInput = TestUtils.renderIntoDocument(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        />
    );
    let input = TestUtils.findRenderedDOMComponentWithTag(editableInput, "input");
    expect(input.hasAttribute("disabled")).toBeTruthy();
  });

  it("calls provided onChange", () => {
    let onChange = jest.genMockFunction();
    editableInput = TestUtils.renderIntoDocument(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        onChange={onChange}
        />
    );

    let input = TestUtils.findRenderedDOMComponentWithTag(editableInput, "input");
    input["value"] = "new value";
    TestUtils.Simulate.change(input);
    expect(onChange.mock.calls.length).toEqual(1);
  });
});

describe("EditForm", () => {
  let bookData = {
    title: "title",
    audience: "Young Adult",
    targetAgeRange: ["12", "16"],
    summary: "summary",
    editLink: {
      href: "href",
      rel: "edit"
    }
  };

  describe("rendering", () => {
    let editForm;

    beforeEach(() => {
      editForm = TestUtils.renderIntoDocument(
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
      let input = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput)[0];
      expect(input.props.label).toBe("Title");
      expect(input.props.value).toBe("title");
    });

    it("shows editable select with audience", () => {
      let input = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput)[1];
      expect(input.props.type).toBe("select")
      expect(input.props.label).toBe("Audience");
      expect(input.props.value).toBe("Young Adult");
    });

    it("shows editable inputs with min and max target age", () => {
      let input = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput)[2];
      expect(input.props.label).toBe("");
      expect(input.props.value).toBe("12");

      input = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput)[3];
      expect(input.props.label).toBe("");
      expect(input.props.value).toBe("16");
    });

    it("shows editable input with summary", () => {
      let input = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput)[4];
      expect(input.props.label).toBe("Summary");
      expect(input.props.value).toBe("summary");
    });
  });

  it("shows and hides target age inputs when audience changes", () => {
    let wrapper = mount(
      <EditForm
        {...bookData}
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        editBook={jest.genMockFunction()}
        />
    );

    let minAgeInput = wrapper.find("input[name='target_age_min']");
    let maxAgeInput = wrapper.find("input[name='target_age_max']");
    expect(minAgeInput.length).toBe(1);
    expect(maxAgeInput.length).toBe(1);

    let select = wrapper.find("select") as any;
    let selectElement = select.get(0);
    selectElement.value = "Adult";
    select.simulate("change");
    minAgeInput = wrapper.find("input[name='target_age_min']");
    maxAgeInput = wrapper.find("input[name='target_age_max']");
    expect(minAgeInput.length).toBe(0);
    expect(maxAgeInput.length).toBe(0);

    selectElement.value = "Children";
    select.simulate("change");
    minAgeInput = wrapper.find("input[name='target_age_min']");
    maxAgeInput = wrapper.find("input[name='target_age_max']");
    expect(minAgeInput.length).toBe(1);
    expect(maxAgeInput.length).toBe(1);
  });

  it("calls editBook on submit", () => {
    let editBook = jest.genMockFunction();
    editBook.mockReturnValue(new Promise((resolve, reject) => {
      resolve();
    }));
    let editForm = TestUtils.renderIntoDocument(
      <EditForm
        {...bookData}
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        editBook={editBook}
        />
    );

    let form = TestUtils.findRenderedDOMComponentWithTag(editForm, "form");
    TestUtils.Simulate.submit(form);

    expect(editBook.mock.calls.length).toBe(1);
    expect(editBook.mock.calls[0][0]).toBe("href");
    expect(editBook.mock.calls[0][1].get("csrf_token").value).toBe("token");
    expect(editBook.mock.calls[0][1].get("title").value).toBe(bookData.title);
    expect(editBook.mock.calls[0][1].get("audience").value).toBe(bookData.audience);
    expect(editBook.mock.calls[0][1].get("summary").value).toBe(bookData.summary);
  });

  it("refreshes book after editing", (done) => {
    let editBook = jest.genMockFunction();
    editBook.mockReturnValue(new Promise((resolve, reject) => {
      resolve();
    }));
    let editForm = TestUtils.renderIntoDocument(
      <EditForm
        {...bookData}
        csrfToken=""
        disabled={false}
        refresh={done}
        editBook={editBook}
        />
    );

    let form = TestUtils.findRenderedDOMComponentWithTag(editForm, "form");
    TestUtils.Simulate.submit(form);
  });

  it("disables all inputs", () => {
    let editForm = TestUtils.renderIntoDocument(
      <EditForm
        {...bookData}
        csrfToken=""
        disabled={true}
        refresh={jest.genMockFunction()}
        editBook={jest.genMockFunction()}
        />
    );
    let inputs = TestUtils.scryRenderedComponentsWithType(editForm, EditableInput);
    inputs.forEach((input) => {
      expect(input.props.disabled).toBeTruthy();
    });
  });
});