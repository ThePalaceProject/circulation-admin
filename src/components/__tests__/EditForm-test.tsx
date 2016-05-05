jest.dontMock("../EditForm");

import * as React from "react";
import { shallow, mount } from "enzyme";

import EditForm, { EditableInput } from "../EditForm";
import { Input, ButtonInput } from "react-bootstrap";

describe("EditableInput", () => {
  it("shows label from props", () => {
    let wrapper = shallow(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    let input = wrapper.find(Input);
    expect(input.props().label).toEqual("label");
  });

  it("shows initial value from props", () => {
    let wrapper = shallow(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    expect(wrapper.state().value).toEqual("initial value");
    let input = wrapper.find(Input);
    expect(input.props().value).toEqual("initial value");
  });

  it("shows children from props", () => {
    let wrapper = shallow(
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
    let option = wrapper.find("option")
    expect(option.text()).toEqual("option");
  });

  it("shows checked from props", () => {
    let wrapper = shallow(
      <EditableInput
        type="select"
        label="label"
        name="name"
        disabled={false}
        checked={true}
        />
    );
    let input = wrapper.find(Input)
    expect(input.props().checked).toEqual(true);
  });

  it("updates state and value when props change", () => {
    let wrapper = shallow(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    wrapper.setProps({ value: "new value" });
    expect(wrapper.state().value).toBe("new value");
    let input = wrapper.find(Input);
    expect(input.props().value).toEqual("new value");
  });

  it("updates state when input changes", () => {
    let wrapper = mount(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        checked={false}
        />
    );
    expect(wrapper.state().value).toBe("initial value");
    expect(wrapper.state().checked).toBe(false);
    let input = wrapper.find(Input);
    expect(input.props().value).toBe("initial value");
    expect(input.props().checked).toEqual(false);
  });

  it("updates value in state when input changes", () => {
    let wrapper = mount(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(wrapper.state().value).toBe("new value");
  });

  it("updates checked in state when input changes", () => {
    let wrapper = mount(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.checked = true;
    input.simulate("change");
    expect(wrapper.state().checked).toBe(true);
  });

  it("disables", () => {
    let wrapper = mount(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    expect(input.props().disabled).toBeTruthy();
  });

  it("calls provided onChange", () => {
    let onChange = jest.genMockFunction();
    let wrapper = mount(
      <EditableInput
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        onChange={onChange}
        />
    );

    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(onChange.mock.calls.length).toBe(1);
  });
});

describe("EditForm", () => {
  let bookData = {
    title: "title",
    fiction: true,
    audience: "Young Adult",
    targetAgeRange: ["12", "16"],
    summary: "summary",
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

    it("shows editable select with audience", () => {
      let input = editableInputByName("audience");
      expect(input.props().type).toBe("select")
      expect(input.props().label).toBe("Audience");
      expect(input.props().value).toBe("Young Adult");
    });

    it("shows editable inputs with min and max target age", () => {
      let input = editableInputByName("target_age_min");
      expect(input.props().label).toBe("");
      expect(input.props().value).toBe("12");

      input = editableInputByName("target_age_max");
      expect(input.props().label).toBe("");
      expect(input.props().value).toBe("16");
    });

    it("shows editable radio buttons with fiction status", () => {
      let fictionInput = editableInputByValue("fiction");
      let nonfictionInput = editableInputByValue("nonfiction");

      expect(fictionInput.props().type).toBe("radio");
      expect(fictionInput.props().label).toBe(" Fiction");
      expect(fictionInput.props().checked).toBe(true);
      expect(fictionInput.props().value).toBe("fiction");

      expect(nonfictionInput.props().type).toBe("radio");
      expect(nonfictionInput.props().label).toBe(" Nonfiction");
      expect(nonfictionInput.props().checked).toBe(false);
      expect(nonfictionInput.props().value).toBe("nonfiction");
    });

    it("shows editable input with summary", () => {
      let input = editableInputByName("summary");
      expect(input.props().label).toBe("Summary");
      expect(input.props().value).toBe("summary");
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

  it("changes both fiction status radio buttons", () => {
    let wrapper = mount(
      <EditForm
        {...bookData}
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        editBook={jest.genMockFunction()}
        />
    );

    let fictionInput = wrapper.find("input[value='fiction']");
    let nonfictionInput = wrapper.find("input[value='nonfiction']");
    expect(fictionInput.length).toEqual(1);
    expect(nonfictionInput.length).toEqual(1);

    let fictionElement = fictionInput.get(0);
    let nonfictionElement = nonfictionInput.get(0);

    expect((fictionElement as any).checked).toBeTruthy();
    expect((nonfictionElement as any).checked).toBeFalsy();

    (nonfictionElement as any).checked = true;
    nonfictionInput.simulate("change");

    expect((fictionElement as any).checked).toBeFalsy();
    expect((nonfictionElement as any).checked).toBeTruthy();

    (fictionElement as any).checked = true;
    fictionInput.simulate("change");

    expect((fictionElement as any).checked).toBeTruthy();
    expect((nonfictionElement as any).checked).toBeFalsy();
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
    expect(editBook.mock.calls[0][1].get("fiction").value).toBe("fiction");
    expect(editBook.mock.calls[0][1].get("audience").value).toBe(bookData.audience);
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
    inputs.forEach((input) => {
      expect(input.props().disabled).toBeTruthy();
    });
  });
});