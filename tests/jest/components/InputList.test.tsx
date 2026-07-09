import * as React from "react";
import { render, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProtocolFormField from "../../../src/components/ProtocolFormField";

// InputList is always rendered by ProtocolFormField, which supplies the real
// `createEditableInput` and `labelAndDescription` callbacks it depends on (the
// legacy test wired these up by mounting a ProtocolFormField and spying on its
// methods). Rendering through ProtocolFormField exercises the same wiring while
// letting us assert the DOM the InputList actually produces. The imperative
// `getValue()` / `clear()` API is exposed through ProtocolFormField's ref, which
// is how production calls it.

const setting = {
  key: "setting",
  label: "label",
  description: "description",
  type: "list",
};
const value = ["Thing 1", "Thing 2"];

const renderList = (
  { setting: s = setting, value: v = value, ...rest }: any = {},
  ref?: React.Ref<ProtocolFormField>
) =>
  render(
    <ProtocolFormField
      ref={ref}
      setting={s}
      value={v}
      disabled={false}
      {...rest}
    />
  );

// The list-item inputs live in the `ul.input-list-ul`; the "add" input lives in
// `.add-list-item-container`.
const itemInputs = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>(
      "ul.input-list-ul input.form-control"
    )
  );
const addInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    ".add-list-item-container span.add-list-item input"
  );
const addButton = (container: HTMLElement) =>
  container.querySelector<HTMLButtonElement>("button.add-list-item");
const removeButtons = (container: HTMLElement) =>
  container.querySelectorAll("button.remove-btn");
const listItemWrappers = (container: HTMLElement) =>
  container.querySelectorAll(".with-remove-button");

describe("InputList", () => {
  it("renders a label and description", () => {
    const { container } = renderList();
    const labels = container.querySelectorAll("label");
    expect(labels).toHaveLength(1);
    expect(labels[0]).toHaveTextContent("label");

    // The first `.description` is the one produced by labelAndDescription.
    const description = container.querySelectorAll(".description")[0];
    expect(description).toHaveTextContent("description");
  });

  it("renders a list of items", () => {
    const { container } = renderList();
    const inputs =
      container.querySelectorAll<HTMLInputElement>("input.form-control");
    // Two existing items plus the empty "add" input.
    expect(inputs).toHaveLength(3);

    expect(inputs[0]).toHaveValue("Thing 1");
    expect(inputs[0]).toHaveAttribute("type", "text");
    expect(inputs[0]).toHaveAttribute("name", "setting");

    expect(inputs[1]).toHaveValue("Thing 2");
    expect(inputs[1]).toHaveAttribute("type", "text");
    expect(inputs[1]).toHaveAttribute("name", "setting");

    expect(inputs[2]).toHaveValue("");
    expect(inputs[2]).toHaveAttribute("type", "text");
    expect(inputs[2]).toHaveAttribute("name", "setting");
  });

  it("optionally renders links", () => {
    const urlBase = (itemName: string) => `admin/web/${itemName}`;
    const { container } = renderList({ setting: { ...setting, urlBase } });
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);
    links.forEach((link, idx) => {
      expect(link).toHaveTextContent(`Thing ${idx + 1}`);
      expect(link).toHaveAttribute("href", `admin/web/Thing ${idx + 1}`);
    });
  });

  it("renders WithRemoveButton elements", () => {
    const { container } = renderList();
    const wrappers = listItemWrappers(container);
    expect(wrappers).toHaveLength(2);
    const removes = removeButtons(container);
    expect(removes).toHaveLength(2);
    removes.forEach((btn) => expect(btn).not.toBeDisabled());

    const inputs = itemInputs(container);
    expect(inputs[0]).toHaveValue("Thing 1");
    expect(inputs[1]).toHaveValue("Thing 2");
  });

  it("optionally disables the remove buttons", () => {
    const { container } = renderList({ disableButton: true });
    const removes = removeButtons(container);
    expect(removes).toHaveLength(2);
    removes.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("renders a button for adding a list item", () => {
    const { container } = renderList();
    const addContainer = container.querySelector(".add-list-item-container");
    expect(addContainer).toBeInTheDocument();
    expect(addInput(container)).toHaveValue("");
    // The add container itself has no remove buttons.
    expect(addContainer.querySelectorAll(".with-remove-button")).toHaveLength(
      0
    );
    expect(addButton(container)).toHaveTextContent("Add");
  });

  it("optionally renders a geographic tooltip with extra content", () => {
    const valueWithObject = [{ "Thing 3": "extra information!" }];
    const geographicSetting = { ...setting, format: "geographic" };
    const { container } = renderList({
      setting: geographicSetting,
      value: valueWithObject,
    });

    const withAddOn = container.querySelectorAll(".with-add-on");
    expect(withAddOn).toHaveLength(1);

    const addOn = withAddOn[0].querySelectorAll(".input-group-addon");
    expect(addOn).toHaveLength(1);

    expect(container.querySelector("svg.locatorIcon")).toBeInTheDocument();

    const toolTip = container.querySelector(".tool-tip");
    expect(toolTip).toHaveClass("point-right");
    expect(toolTip).toHaveTextContent("extra information!");

    const input = withAddOn[0].querySelector("input");
    expect(input).toHaveValue("Thing 3");
  });

  it("renders an autocomplete field for languages", () => {
    const languageSetting = { ...setting, format: "language-code" };
    const languages = {
      eng: ["English"],
      spa: ["Spanish", "Castilian"],
    };
    const { container } = renderList({
      setting: languageSetting,
      value: ["abc"],
      additionalData: languages,
    });
    const languageInputs = container.querySelectorAll<HTMLInputElement>(
      'input[list="setting-autocomplete-list"]'
    );
    // One for the existing "abc" item, one for the empty "add" field.
    expect(languageInputs).toHaveLength(2);

    expect(languageInputs[0]).toHaveValue("abc");
    expect(languageInputs[0]).toHaveAttribute("name", "setting");

    expect(languageInputs[1]).toHaveValue("");
    expect(languageInputs[1]).toHaveAttribute("name", "setting");
  });

  it("removes an item", async () => {
    const user = userEvent.setup();
    const { container } = renderList();
    expect(listItemWrappers(container)).toHaveLength(2);

    await user.click(removeButtons(container)[0]);

    await waitFor(() => expect(listItemWrappers(container)).toHaveLength(1));
  });

  it("adds a regular item", async () => {
    const user = userEvent.setup();
    const { container } = renderList();
    expect(listItemWrappers(container)).toHaveLength(2);

    await user.type(addInput(container), "Another thing...");
    await user.click(addButton(container));

    await waitFor(() => expect(listItemWrappers(container)).toHaveLength(3));
    expect(addInput(container)).toHaveValue("");
  });

  it("adds and capitalizes an item", async () => {
    const user = userEvent.setup();
    // capitalize only runs when the setting has capitalize set; the geographic
    // format is what makes two-letter tokens uppercase.
    const capSetting = { ...setting, capitalize: true, format: "geographic" };
    const { container } = renderList({ setting: capSetting, value: [] });

    await user.type(addInput(container), "california");
    await user.click(addButton(container));
    await waitFor(() =>
      expect(itemInputs(container)[0]).toHaveValue("California")
    );

    await user.type(addInput(container), "fl");
    await user.click(addButton(container));
    await waitFor(() => expect(itemInputs(container)[1]).toHaveValue("FL"));

    await user.type(addInput(container), "new york city, ny");
    await user.click(addButton(container));
    await waitFor(() =>
      expect(itemInputs(container)[2]).toHaveValue("New York City, NY")
    );

    expect(addInput(container)).toHaveValue("");
  });

  it("adds an autocompleted item", async () => {
    const user = userEvent.setup();
    const languageSetting = { ...setting, format: "language-code" };
    const { container } = renderList({
      setting: languageSetting,
      value: ["abc"],
    });

    let autocompletes = container.querySelectorAll<HTMLInputElement>(
      'input[list="setting-autocomplete-list"]'
    );
    expect(autocompletes).toHaveLength(2);

    await user.type(autocompletes[1], "Another language");
    await user.click(addButton(container));

    await waitFor(() => {
      autocompletes = container.querySelectorAll<HTMLInputElement>(
        'input[list="setting-autocomplete-list"]'
      );
      expect(autocompletes).toHaveLength(3);
    });
    expect(autocompletes[2]).toHaveValue("");
  });

  it("does not add an empty input item", async () => {
    const user = userEvent.setup();
    const { container } = renderList();
    expect(listItemWrappers(container)).toHaveLength(2);
    // The add button is disabled while the input is blank.
    expect(addButton(container)).toBeDisabled();

    await user.type(addInput(container), "something new");
    expect(addButton(container)).not.toBeDisabled();

    await user.click(addButton(container));
    await waitFor(() => expect(listItemWrappers(container)).toHaveLength(3));
    // Once added, the input is cleared and the button is disabled again.
    expect(addButton(container)).toBeDisabled();
  });

  it("optionally accepts an onChange prop", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = renderList({ onChange });
    expect(onChange).not.toHaveBeenCalled();

    await user.type(addInput(container), "test");
    await user.click(addButton(container));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0]).toHaveProperty("listItems");

    await user.click(removeButtons(container)[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    expect(onChange.mock.calls[1][0]).toHaveProperty("listItems");
  });

  it("optionally accepts a readOnly prop", () => {
    const { container } = renderList({ readOnly: true });
    const inputs = itemInputs(container);
    expect(inputs[0]).toHaveAttribute("readonly");
    expect(inputs[1]).toHaveAttribute("readonly");
  });

  it("gets the value", () => {
    const ref = React.createRef<ProtocolFormField>();
    renderList({}, ref);
    expect(ref.current!.getValue()).toStrictEqual(value);
  });

  it("clears all the items", () => {
    const ref = React.createRef<ProtocolFormField>();
    const { container } = renderList({}, ref);
    expect(listItemWrappers(container)).toHaveLength(2);

    act(() => {
      ref.current!.clear();
    });

    expect(listItemWrappers(container)).toHaveLength(0);
  });

  describe("dropdown menu", () => {
    const menuOptions = [1, 2, 3].map((n) => (
      <option value={`Option ${n}`} key={n} aria-selected={false}>
        {`Option ${n}`}
      </option>
    ));
    const menuSetting = {
      ...setting,
      type: "menu",
      menuOptions,
      description: null,
    };

    it("renders a dropdown menu", () => {
      const { container } = renderList({ setting: menuSetting });
      const menu = container.querySelectorAll("select");
      expect(menu).toHaveLength(1);
      const options = menu[0].querySelectorAll("option");
      expect(options).toHaveLength(3);
      options.forEach((option, idx) => {
        expect(option).toHaveTextContent(`Option ${idx + 1}`);
      });
    });

    it("adds an item from the menu", async () => {
      const user = userEvent.setup();
      const { container } = renderList({ setting: menuSetting });
      expect(listItemWrappers(container)).toHaveLength(2);
      // The select defaults to the first option.
      expect(container.querySelector("select")).toHaveValue("Option 1");

      await user.click(addButton(container));

      await waitFor(() => expect(listItemWrappers(container)).toHaveLength(3));
      const inputs = itemInputs(container);
      expect(inputs[inputs.length - 1]).toHaveValue("Option 1");
    });

    it("doesn't lose options when nothing is selected", () => {
      const narrowSetting = {
        ...menuSetting,
        default: null,
        format: "narrow",
      };
      const { container } = renderList({
        setting: narrowSetting,
        value: null,
      });
      expect(container.querySelectorAll("option")).toHaveLength(3);
    });

    it("optionally eliminates already-selected options from the menu", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderList({ setting: menuSetting });
      let options = container.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect(
        Array.from(options).some((o) => o.textContent === "Option 1")
      ).toBe(true);

      // Adding an option while the format is not "narrow" leaves the menu intact.
      await user.click(addButton(container));
      await waitFor(() => expect(listItemWrappers(container)).toHaveLength(3));
      options = container.querySelectorAll("option");
      expect(options).toHaveLength(3);

      // Switch to the "narrow" format, which prunes selected options.
      const narrowSetting = { ...menuSetting, format: "narrow" };
      rerender(
        <ProtocolFormField
          setting={narrowSetting}
          value={value}
          disabled={false}
        />
      );

      await user.click(addButton(container));
      await waitFor(() => {
        options = container.querySelectorAll("option");
        expect(options).toHaveLength(2);
      });
      expect(
        Array.from(container.querySelectorAll("option")).some(
          (o) => o.textContent === "Option 1"
        )
      ).toBe(false);
    });

    it("optionally renders a label", () => {
      const settingWithLabel = {
        ...menuSetting,
        menuTitle: "Custom Menu Title",
      };
      const { container } = renderList({ setting: settingWithLabel });
      const label = container.querySelector("select").closest("label");
      expect(label).toHaveTextContent("Custom Menu Title");
    });

    it("optionally marks the menu as required", () => {
      const { container, rerender } = renderList({ setting: menuSetting });
      expect(container.querySelectorAll(".required-field")).toHaveLength(0);

      const requiredSetting = {
        ...menuSetting,
        menuTitle: "title",
        required: true,
      };
      rerender(
        <ProtocolFormField
          setting={requiredSetting}
          value={value}
          disabled={false}
        />
      );
      const required = container.querySelectorAll(".required-field");
      expect(required).toHaveLength(1);
      expect(required[0]).toHaveTextContent("Required");
    });

    it("optionally renders an alternate value if there are no list items", () => {
      const { container, rerender } = renderList({
        setting: menuSetting,
        altValue: "No list items!",
      });
      // There are still list items, so the placeholder isn't rendered yet.
      expect(container.querySelectorAll(".input-list > span")).toHaveLength(0);

      rerender(
        <ProtocolFormField
          setting={menuSetting}
          value={[]}
          altValue="No list items!"
          disabled={false}
        />
      );
      const placeholder = container.querySelectorAll(".input-list > span");
      expect(placeholder).toHaveLength(1);
      expect(placeholder[0]).toHaveTextContent("No list items!");
    });

    it("optionally renders an alternate value if all the available list items have already been added", () => {
      const narrowSetting = { ...menuSetting, format: "narrow" };
      const { container } = renderList({
        setting: narrowSetting,
        value: ["Option 1", "Option 2", "Option 3"],
        onEmpty: "You've run out of options!",
      });
      expect(container.querySelector("select")).not.toBeInTheDocument();
      const message = container.querySelector(".add-list-item-container span");
      expect(message).toHaveTextContent("You've run out of options!");
    });

    it("renders option elements if necessary", () => {
      // Without a menuOptions property, InputList builds the menu from `options`.
      const options = [
        { key: "key_1", label: "label_1" },
        { key: "key_2", label: "label_2" },
      ];
      const optionsSetting = { ...menuSetting, options, menuOptions: null };
      const { container } = renderList({ setting: optionsSetting });
      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
      const opts = select.querySelectorAll("option");
      expect(opts[0]).toHaveValue("key_1");
      expect(opts[0]).toHaveTextContent("label_1");
      expect(opts[1]).toHaveValue("key_2");
      expect(opts[1]).toHaveTextContent("label_2");
    });

    it("renders the default values", () => {
      const defaultSetting = {
        ...menuSetting,
        default: ["Option 1", "Option 2"],
      };
      const { container } = renderList({
        setting: defaultSetting,
        value: null,
      });
      const inputs = itemInputs(container);
      expect(inputs[0]).toHaveValue("Option 1");
      expect(inputs[1]).toHaveValue("Option 2");
      // The remaining option is still available in the menu.
      expect(container.querySelector("select")).toBeInTheDocument();
    });
  });
});
