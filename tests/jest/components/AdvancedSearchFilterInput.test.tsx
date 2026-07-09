import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvancedSearchFilterInput from "../../../src/components/AdvancedSearchFilterInput";
import {
  fields,
  operators,
} from "../../../src/components/AdvancedSearchBuilder";

describe("AdvancedSearchFilterInput", () => {
  let onAdd;
  let onClearFiltersFlagChange;

  const renderInput = () =>
    render(
      <AdvancedSearchFilterInput
        name="include"
        onAdd={onAdd}
        onClearFiltersFlagChange={onClearFiltersFlagChange}
      />
    );

  const fieldKeySelect = () =>
    screen.getByRole("combobox", { name: "filter field key" });
  const operatorSelect = () =>
    screen.getByRole("combobox", { name: "filter operator" });

  beforeEach(() => {
    onAdd = jest.fn();
    onClearFiltersFlagChange = jest.fn();
  });

  it("should render select with field names for field selection", () => {
    renderInput();

    const options = within(fieldKeySelect()).getAllByRole("option");

    expect(options).toHaveLength(fields.length);

    fields.forEach((field, index) => {
      expect(options[index]).toHaveValue(field.value);
    });
  });

  it("should render a select with options for operator selection", () => {
    renderInput();

    const options = within(operatorSelect()).getAllByRole("option");

    expect(options).toHaveLength(operators.length);

    operators.forEach((op, index) => {
      expect(options[index]).toHaveValue(op.value);
    });
  });

  it("should restrict the operator selection, if the filter requests it", async () => {
    const user = userEvent.setup();
    renderInput();

    // Select the fiction field key.
    await user.selectOptions(fieldKeySelect(), "fiction");

    // Look up the fiction field operator values.
    const fictionField = fields.find((element) => element.value === "fiction");
    const options = within(operatorSelect()).getAllByRole("option");

    // And make sure the number of options is correct.
    expect(options).toHaveLength(fictionField.operators.length);
    options.forEach((option, index) => {
      expect(option).toHaveValue(fictionField.operators[index]);
    });
  });

  it("should use the currently selected operator when changing filters", async () => {
    const user = userEvent.setup();
    renderInput();

    const fictionField = fields.find((element) => element.value === "fiction");

    await user.selectOptions(operatorSelect(), "regex");

    // Select data source/Distributor as the filter key.
    await user.selectOptions(fieldKeySelect(), "data_source");
    expect(operatorSelect()).toHaveValue("regex");

    // But the "regex" operator is not supported by the "fiction" field,
    // so we switch to fiction's first available operator.
    await user.selectOptions(fieldKeySelect(), "fiction");
    expect(operatorSelect()).toHaveValue(fictionField.operators[0]);

    // Since data source/distributor supports fiction's first operator,
    // we'll continue to use it when changing back to that field.
    await user.selectOptions(fieldKeySelect(), "data_source");
    expect(operatorSelect()).toHaveValue(fictionField.operators[0]);
  });

  it("should render a text input for value entry", () => {
    renderInput();

    expect(
      screen.getByRole("textbox", { name: "filter value" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "filter value" })
    ).not.toBeInTheDocument();
  });

  it("surfaces the field's placeholder and help text for the publication date field", async () => {
    const user = userEvent.setup();
    renderInput();

    // "publication date" is the only field that defines a placeholder and
    // helpText; selecting it surfaces both on the value input (as its
    // placeholder and accessible description). This is the sole coverage for
    // those two props of AdvancedSearchFilterInput.
    await user.selectOptions(fieldKeySelect(), "published");

    const valueInput = screen.getByRole("textbox", { name: "filter value" });
    expect(valueInput).toHaveAttribute("placeholder", "YYYY-MM-DD");
    expect(valueInput).toHaveAccessibleDescription(/publication date/i);
    expect(valueInput).toHaveAccessibleDescription(/YYYY-MM-DD/i);
  });

  it("should render a select for value selection, if the filter requests it", async () => {
    const user = userEvent.setup();
    renderInput();

    await user.selectOptions(fieldKeySelect(), "fiction");

    expect(
      screen.getByRole("combobox", { name: "filter value" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "filter value" })
    ).not.toBeInTheDocument();
  });

  it("should clear the current value when changing the filter", async () => {
    const user = userEvent.setup();
    renderInput();

    const valueInput = screen.getByRole("textbox", { name: "filter value" });

    await user.type(valueInput, "ABC");

    await user.selectOptions(fieldKeySelect(), "data_source");

    expect(screen.getByRole("textbox", { name: "filter value" })).toHaveValue(
      ""
    );
  });

  it("should render an Add Filter button", () => {
    renderInput();

    const buttons = screen.getAllByRole("button");

    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("Add filter");
  });

  it("should disable the Add Filter button when the value is blank", async () => {
    const user = userEvent.setup();
    renderInput();

    const valueInput = screen.getByRole("textbox", { name: "filter value" });

    expect(screen.getByRole("button", { name: "Add filter" })).toBeDisabled();

    await user.type(valueInput, "   ");
    expect(screen.getByRole("button", { name: "Add filter" })).toBeDisabled();

    await user.clear(valueInput);
    await user.type(valueInput, "hello");
    expect(screen.getByRole("button", { name: "Add filter" })).toBeEnabled();
  });

  it("should call onAdd when the Add Filter button is clicked", async () => {
    const user = userEvent.setup();
    renderInput();

    const valueInput = screen.getByRole("textbox", { name: "filter value" });

    await user.type(valueInput, "hello");
    await user.click(screen.getByRole("button", { name: "Add filter" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      key: "genre",
      op: "eq",
      value: "hello",
    });
  });

  it("should trim whitespace from the value", async () => {
    const user = userEvent.setup();
    renderInput();

    const valueInput = screen.getByRole("textbox", { name: "filter value" });

    await user.type(valueInput, "  hello  ");
    await user.click(screen.getByRole("button", { name: "Add filter" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      key: "genre",
      op: "eq",
      value: "hello",
    });
  });
});
