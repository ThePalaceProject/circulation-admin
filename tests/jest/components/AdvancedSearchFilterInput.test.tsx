import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  fields,
  operators,
} from "../../../src/components/lists/AdvancedSearchBuilder";
import AdvancedSearchFilterInput from "../../../src/components/lists/AdvancedSearchFilterInput";

function renderFilterInput(props = {}) {
  const defaultProps = {
    name: "include",
    onAdd: jest.fn(),
    onClearFiltersFlagChange: jest.fn(),
  };
  return render(<AdvancedSearchFilterInput {...defaultProps} {...props} />);
}

describe("AdvancedSearchFilterInput", () => {
  it("renders a select with field names for field selection", () => {
    const { container } = renderFilterInput();
    const options = container.querySelectorAll(".filter-key select > option");
    expect(options.length).toBe(fields.length);
    fields.forEach((field, index) => {
      expect((options[index] as HTMLOptionElement).value).toBe(field.value);
    });
  });

  it("renders a select with operator options", () => {
    const { container } = renderFilterInput();
    const options = container.querySelectorAll(
      ".filter-operator select > option"
    );
    expect(options.length).toBe(operators.length);
    operators.forEach((op, index) => {
      expect((options[index] as HTMLOptionElement).value).toBe(op.value);
    });
  });

  it("restricts the operator selection when a field requests it", () => {
    const { container } = renderFilterInput();
    const filterKeySelect = container.querySelector(
      ".filter-key select"
    ) as HTMLSelectElement;
    fireEvent.change(filterKeySelect, { target: { value: "fiction" } });

    const fictionField = fields.find((f) => f.value === "fiction");
    const options = container.querySelectorAll(
      ".filter-operator select > option"
    );
    expect(options.length).toBe(fictionField.operators.length);
    fictionField.operators.forEach((op, index) => {
      expect((options[index] as HTMLOptionElement).value).toBe(op);
    });
  });

  it("renders a text input for value entry by default", () => {
    const { container } = renderFilterInput();
    const valueSelect = container.querySelector(".filter-value select");
    const valueInput = container.querySelector(
      '.filter-value input[type="text"]'
    );
    expect(valueSelect).toBeNull();
    expect(valueInput).not.toBeNull();
  });

  it("renders a select for value selection when the field has options", () => {
    const { container } = renderFilterInput();
    const filterKeySelect = container.querySelector(
      ".filter-key select"
    ) as HTMLSelectElement;
    fireEvent.change(filterKeySelect, { target: { value: "fiction" } });

    const valueSelect = container.querySelector(".filter-value select");
    const valueInput = container.querySelector(
      '.filter-value input[type="text"]'
    );
    expect(valueSelect).not.toBeNull();
    expect(valueInput).toBeNull();
  });

  it("renders an Add Filter button", () => {
    const { container } = renderFilterInput();
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("Add filter");
  });

  it("disables the Add Filter button when the value is blank", () => {
    const { container } = renderFilterInput();
    const valueInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = container.querySelector("button") as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    fireEvent.change(valueInput, { target: { value: "   " } });
    expect(button.disabled).toBe(true);

    fireEvent.change(valueInput, { target: { value: "hello" } });
    expect(button.disabled).toBe(false);
  });

  it("calls onAdd when the Add Filter button is clicked", () => {
    const onAdd = jest.fn();
    const { container } = renderFilterInput({ onAdd });
    const valueInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = container.querySelector("button");

    fireEvent.change(valueInput, { target: { value: "hello" } });
    fireEvent.click(button);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      key: "genre",
      op: "eq",
      value: "hello",
    });
  });

  it("trims whitespace from the value when calling onAdd", () => {
    const onAdd = jest.fn();
    const { container } = renderFilterInput({ onAdd });
    const valueInput = container.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const button = container.querySelector("button");

    fireEvent.change(valueInput, { target: { value: "\thello  " } });
    fireEvent.click(button);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      key: "genre",
      op: "eq",
      value: "hello",
    });
  });

  it("clears the current value when changing the filter key", () => {
    const { container } = renderFilterInput();
    const filterKeySelect = container.querySelector(
      ".filter-key select"
    ) as HTMLSelectElement;
    const valueInput = container.querySelector(
      ".filter-value input"
    ) as HTMLInputElement;

    fireEvent.change(valueInput, { target: { value: "ABC" } });
    expect(valueInput.value).toBe("ABC");

    fireEvent.change(filterKeySelect, { target: { value: "data_source" } });
    expect(valueInput.value).toBe("");
  });

  it("uses the currently selected operator when changing filters", () => {
    const { container } = renderFilterInput();
    const filterKeySelect = container.querySelector(
      ".filter-key select"
    ) as HTMLSelectElement;
    const operatorSelect = container.querySelector(
      ".filter-operator select"
    ) as HTMLSelectElement;

    // Set operator to "regex"
    fireEvent.change(operatorSelect, { target: { value: "regex" } });

    // Switch to data_source — should keep "regex"
    fireEvent.change(filterKeySelect, { target: { value: "data_source" } });
    expect(operatorSelect.value).toBe("regex");

    // Switch to fiction — "regex" not supported, so switch to first fiction operator
    const fictionField = fields.find((f) => f.value === "fiction");
    fireEvent.change(filterKeySelect, { target: { value: "fiction" } });
    expect(operatorSelect.value).toBe(fictionField.operators[0]);

    // Switch back to data_source — should keep fiction's operator since data_source supports it
    fireEvent.change(filterKeySelect, { target: { value: "data_source" } });
    expect(operatorSelect.value).toBe(fictionField.operators[0]);
  });
});
