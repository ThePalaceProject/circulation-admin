import * as React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import InputList from "../../../src/components/shared/InputList";
import ProtocolFormField from "../../../src/components/config/ProtocolFormField";

// ── shared fixtures ───────────────────────────────────────────────────────────

const value = ["Thing 1", "Thing 2"];
const setting = {
  key: "setting",
  label: "label",
  description: "description",
  type: "list",
};

/** Build createEditableInput / labelAndDescription from a real ProtocolFormField. */
function makeHelpers(overrideSetting = setting) {
  const ref = React.createRef<ProtocolFormField>();
  render(
    <ProtocolFormField ref={ref} setting={overrideSetting} disabled={false} />
  );
  return {
    createEditableInput: ref.current!.createEditableInput.bind(ref.current),
    labelAndDescription: ref.current!.labelAndDescription.bind(ref.current),
  };
}

function renderInputList(
  props: Partial<React.ComponentProps<typeof InputList>> = {}
) {
  const { createEditableInput, labelAndDescription } = makeHelpers(
    (props.setting as any) || setting
  );
  return render(
    <InputList
      createEditableInput={createEditableInput}
      labelAndDescription={labelAndDescription}
      value={value}
      setting={setting}
      disabled={false}
      {...props}
    />
  );
}

function renderRef(
  props: Partial<React.ComponentProps<typeof InputList>> = {}
): { ref: React.RefObject<InputList>; container: HTMLElement } {
  const { createEditableInput, labelAndDescription } = makeHelpers(
    (props.setting as any) || setting
  );
  const ref = React.createRef<InputList>();
  const { container } = render(
    <InputList
      ref={ref}
      createEditableInput={createEditableInput}
      labelAndDescription={labelAndDescription}
      value={value}
      setting={setting}
      disabled={false}
      {...props}
    />
  );
  return { ref, container };
}

// ── rendering ─────────────────────────────────────────────────────────────────

describe("InputList rendering", () => {
  it("renders a label and description", () => {
    const { container } = renderInputList();
    const label = container.querySelector("label");
    expect(label).toBeTruthy();
    expect(label!.textContent).toBe("label");
    const description = container.querySelector(".description");
    expect(description!.textContent).toBe("description");
  });

  it("renders a list of items with correct values", () => {
    const { container } = renderInputList();
    const inputs = container.querySelectorAll<HTMLInputElement>(
      "input.form-control"
    );
    // 2 existing items + 1 blank add-item input
    expect(inputs.length).toBe(3);
    expect(inputs[0].value).toBe("Thing 1");
    expect(inputs[0].getAttribute("type")).toBe("text");
    expect(inputs[0].getAttribute("name")).toBe("setting");
    expect(inputs[1].value).toBe("Thing 2");
    expect(inputs[2].value).toBe("");
  });

  it("renders WithRemoveButton elements for each existing item", () => {
    const { container } = renderInputList();
    const removeBtns = container.querySelectorAll("button.remove-btn");
    expect(removeBtns.length).toBe(2);
  });

  it("remove buttons are enabled by default", () => {
    const { container } = renderInputList();
    container
      .querySelectorAll<HTMLButtonElement>("button.remove-btn")
      .forEach((btn) => {
        expect(btn).not.toBeDisabled();
      });
  });

  it("optionally disables the remove buttons", () => {
    const { container, rerender } = renderInputList();
    const { createEditableInput, labelAndDescription } = makeHelpers();

    rerender(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={setting}
        disabled={false}
        disableButton={true}
      />
    );

    container
      .querySelectorAll<HTMLButtonElement>("button.remove-btn")
      .forEach((btn) => {
        expect(btn).toBeDisabled();
      });
  });

  it("renders an Add button for adding a list item", () => {
    const { container } = renderInputList();
    const addBtn = container.querySelector("button.add-list-item");
    expect(addBtn).toBeTruthy();
    expect(addBtn!.textContent).toBe("Add");
  });

  it("Add button is disabled when new item input is empty", () => {
    const { container } = renderInputList();
    const addBtn = container.querySelector<HTMLButtonElement>(
      "button.add-list-item"
    )!;
    expect(addBtn).toBeDisabled();
  });

  it("optionally renders links for each item when urlBase is provided", () => {
    const settingWithUrlBase = {
      ...setting,
      urlBase: (itemName: string) => `admin/web/${itemName}`,
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      settingWithUrlBase as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={settingWithUrlBase as any}
        disabled={false}
      />
    );
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe("Thing 1");
    expect(links[0].getAttribute("href")).toBe("admin/web/Thing 1");
    expect(links[1].textContent).toBe("Thing 2");
  });

  it("renders readOnly inputs when readOnly prop is set", () => {
    const { container, rerender } = renderInputList();
    const { createEditableInput, labelAndDescription } = makeHelpers();
    rerender(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={setting}
        disabled={false}
        readOnly={true}
      />
    );
    const inputs = container.querySelectorAll<HTMLInputElement>(
      "input.form-control"
    );
    expect(inputs[0].readOnly).toBe(true);
    expect(inputs[1].readOnly).toBe(true);
  });

  it("renders a geographic tooltip with extra content for geographic format", () => {
    const valueWithObject = [{ "Thing 3": "extra information!" }];
    const geographicSetting = { ...setting, format: "geographic" };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      geographicSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={valueWithObject as any}
        setting={geographicSetting as any}
        disabled={false}
      />
    );
    expect(container.querySelector(".with-add-on")).toBeTruthy();
    expect(container.querySelector(".tool-tip")).toBeTruthy();
    expect(container.querySelector(".tool-tip")!.textContent).toContain(
      "extra information!"
    );
    const input = container.querySelector<HTMLInputElement>(
      "input.form-control"
    );
    expect(input!.value).toBe("Thing 3");
  });

  it("renders language autocomplete fields for language-code format", () => {
    const languageSetting = { ...setting, format: "language-code" };
    const languages = { eng: ["English"], spa: ["Spanish", "Castilian"] };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      languageSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={["abc"] as any}
        setting={languageSetting as any}
        disabled={false}
        additionalData={languages}
      />
    );
    const autocompleteInputs = container.querySelectorAll<HTMLInputElement>(
      "input[list='setting-autocomplete-list']"
    );
    // 1 existing + 1 blank add item
    expect(autocompleteInputs.length).toBe(2);
    expect(autocompleteInputs[0].value).toBe("abc");
    expect(autocompleteInputs[1].value).toBe("");
  });

  it("optionally renders altValue placeholder when there are no items and value is empty", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container, rerender } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={menuSetting as any}
        disabled={false}
        altValue="No list items!"
      />
    );
    // Items present, placeholder not shown
    let placeholder = container.querySelector(".input-list > span");
    expect(placeholder).toBeFalsy();

    rerender(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={[]}
        setting={menuSetting as any}
        disabled={false}
        altValue="No list items!"
      />
    );
    placeholder = container.querySelector(".input-list > span");
    expect(placeholder).toBeTruthy();
    expect(placeholder!.textContent).toBe("No list items!");
  });
});

// ── behaviour ─────────────────────────────────────────────────────────────────

describe("InputList behaviour", () => {
  it("removes an item", () => {
    const { container } = renderInputList();
    const removeBtns = container.querySelectorAll("button.remove-btn");
    expect(removeBtns.length).toBe(2);
    fireEvent.click(removeBtns[0]);
    expect(container.querySelectorAll("button.remove-btn").length).toBe(1);
  });

  it("adds a regular item", async () => {
    const { container } = renderInputList();
    const blankInput = container.querySelector<HTMLInputElement>(
      "span.add-list-item input"
    )!;

    fireEvent.change(blankInput, { target: { value: "Another thing..." } });
    const addBtn = container.querySelector<HTMLButtonElement>(
      "button.add-list-item"
    )!;
    fireEvent.click(addBtn);

    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    const removeBtns = container.querySelectorAll("button.remove-btn");
    expect(removeBtns.length).toBe(3);

    const afterBlank = container.querySelector<HTMLInputElement>(
      "span.add-list-item input"
    )!;
    expect(afterBlank.value).toBe("");
  });

  it("adds and capitalizes an item when capitalize is set", async () => {
    const { createEditableInput, labelAndDescription } = makeHelpers();
    const capitalizeSetting = { ...setting, capitalize: true };
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={capitalizeSetting as any}
        disabled={false}
        capitalize={true}
      />
    );

    const blankInput = container.querySelector<HTMLInputElement>(
      "span.add-list-item input"
    )!;
    fireEvent.change(blankInput, { target: { value: "new york" } });
    fireEvent.click(container.querySelector("button.add-list-item")!);

    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    const removeBtns = container.querySelectorAll("button.remove-btn");
    expect(removeBtns.length).toBe(3);
    // The added item should be capitalized
    const addedInputs = container.querySelectorAll<HTMLInputElement>(
      "input.form-control"
    );
    // Last existing-item input should have "New York"
    const existingInputValues = Array.from(addedInputs)
      .slice(0, -1) // exclude the blank add input
      .map((i) => i.value);
    expect(existingInputValues).toContain("New York");
  });

  it("does not add an empty input", () => {
    const { container } = renderInputList();
    const addBtn = container.querySelector<HTMLButtonElement>(
      "button.add-list-item"
    )!;
    expect(addBtn).toBeDisabled();
    fireEvent.click(addBtn);
    expect(container.querySelectorAll("button.remove-btn").length).toBe(2);
  });

  it("enabling Add button when user types into blank input", () => {
    const { container } = renderInputList();
    const blankInput = container.querySelector<HTMLInputElement>(
      "span.add-list-item input"
    )!;
    fireEvent.change(blankInput, { target: { value: "something new" } });
    const addBtn = container.querySelector<HTMLButtonElement>(
      "button.add-list-item"
    )!;
    expect(addBtn).not.toBeDisabled();
  });

  it("clears all items", () => {
    const { ref, container } = renderRef();
    expect(container.querySelectorAll("button.remove-btn").length).toBe(2);
    act(() => {
      ref.current!.clear();
    });
    expect(container.querySelectorAll("button.remove-btn").length).toBe(0);
  });

  it("calls onChange after addListItem", async () => {
    const onChange = jest.fn();
    const { ref } = renderRef({ onChange });
    await act(async () => {
      ref.current!.addListItem();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("calls onChange after removeListItem", async () => {
    const onChange = jest.fn();
    const { ref } = renderRef({ onChange });
    await act(async () => {
      ref.current!.removeListItem("Thing 1");
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("getValue returns current value", () => {
    const { ref } = renderRef();
    expect(ref.current!.getValue()).toEqual(value);
  });

  it("capitalizes strings correctly", () => {
    const { container } = renderInputList({
      setting: { ...setting, format: "geographic" } as any,
    });
    const ref = React.createRef<InputList>();
    const { createEditableInput, labelAndDescription } = makeHelpers({
      ...setting,
      format: "geographic",
    } as any);
    const { container: c2 } = render(
      <InputList
        ref={ref}
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={{ ...setting, format: "geographic" } as any}
        disabled={false}
      />
    );
    const cap = ref.current!.capitalize;
    expect(cap("california")).toBe("California");
    expect(cap("new jersey")).toBe("New Jersey");
    expect(cap("fl")).toBe("FL");
    expect(cap("new york city, ny")).toBe("New York City, NY");
  });
});

// ── dropdown menu ─────────────────────────────────────────────────────────────

function makeMenuOptions() {
  const options: JSX.Element[] = [];
  for (let i = 1; i <= 3; i++) {
    options.push(
      <option key={i} value={`Option ${i}`} aria-selected={false}>
        {`Option ${i}`}
      </option>
    );
  }
  return options;
}

function renderMenuInputList(
  extraProps: Partial<React.ComponentProps<typeof InputList>> = {},
  currentValue: Array<string | object> = value
) {
  const options = makeMenuOptions();
  const menuSetting = {
    ...setting,
    type: "menu",
    menuOptions: options,
    description: null,
    ...((extraProps.setting as any) || {}),
  };
  const { createEditableInput, labelAndDescription } = makeHelpers(
    menuSetting as any
  );
  return render(
    <InputList
      createEditableInput={createEditableInput}
      labelAndDescription={labelAndDescription}
      value={currentValue}
      setting={menuSetting as any}
      disabled={false}
      {...extraProps}
    />
  );
}

describe("InputList dropdown menu", () => {
  it("renders a dropdown menu with correct options", () => {
    const { container } = renderMenuInputList();
    const select = container.querySelector("select")!;
    expect(select).toBeTruthy();
    const opts = Array.from(select.querySelectorAll("option"));
    expect(opts).toHaveLength(3);
    opts.forEach((opt, idx) => {
      expect(opt.textContent).toBe(`Option ${idx + 1}`);
    });
  });

  it("adds an item from the menu when Add is clicked", () => {
    const { container } = renderMenuInputList();
    const removeBefore = container.querySelectorAll("button.remove-btn").length;
    expect(removeBefore).toBe(2);

    const addBtn = container.querySelectorAll<HTMLButtonElement>("button")[
      container.querySelectorAll("button").length - 1
    ];
    fireEvent.click(addBtn);

    const removeAfter = container.querySelectorAll("button.remove-btn").length;
    expect(removeAfter).toBe(3);
  });

  it("doesn't lose options when nothing is selected (default: null format)", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
      default: null,
      format: "narrow",
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={null}
        setting={menuSetting as any}
        disabled={false}
      />
    );
    const opts = container.querySelectorAll("option");
    expect(opts.length).toBe(3);
  });

  it("optionally renders a label from menuTitle", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
      menuTitle: "Custom Menu Title",
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={menuSetting as any}
        disabled={false}
      />
    );
    // Label wrapping the select should contain the title
    const label = container.querySelector("select")!.closest("label");
    expect(label!.textContent).toContain("Custom Menu Title");
  });

  it("optionally marks menu as required", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
      menuTitle: "title",
      required: true,
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={menuSetting as any}
        disabled={false}
      />
    );
    expect(container.querySelector(".required-field")).toBeTruthy();
    expect(container.querySelector(".required-field")!.textContent).toBe(
      "Required"
    );
  });

  it("renders option elements from options array when menuOptions is null", () => {
    const options = makeMenuOptions();
    const optionData = [
      { key: "key_1", label: "label_1" },
      { key: "key_2", label: "label_2" },
    ];
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: null,
      options: optionData,
      description: null,
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={menuSetting as any}
        disabled={false}
      />
    );
    const opts = container.querySelectorAll("option");
    expect(opts[0].getAttribute("value")).toBe("key_1");
    expect(opts[0].textContent).toBe("label_1");
    expect(opts[1].getAttribute("value")).toBe("key_2");
    expect(opts[1].textContent).toBe("label_2");
  });

  it("renders default values when value is null", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
      default: ["Option 1", "Option 2"],
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={null}
        setting={menuSetting as any}
        disabled={false}
      />
    );
    const inputs = container.querySelectorAll<HTMLInputElement>(
      "input.form-control"
    );
    const inputValues = Array.from(inputs)
      .map((i) => i.value)
      .filter(Boolean);
    expect(inputValues).toContain("Option 1");
    expect(inputValues).toContain("Option 2");
  });

  it("shows 'run out of options' message when all narrow options are selected", () => {
    const options = makeMenuOptions();
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions: options,
      description: null,
      format: "narrow",
    };
    const { createEditableInput, labelAndDescription } = makeHelpers(
      menuSetting as any
    );
    const { container } = render(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={["Option 1", "Option 2", "Option 3"]}
        setting={menuSetting as any}
        disabled={false}
        onEmpty="You've run out of options!"
      />
    );
    const select = container.querySelector("select");
    expect(select).toBeFalsy();
    const message = container.querySelector(".add-list-item-container span");
    expect(message!.textContent).toBe("You've run out of options!");
  });
});
