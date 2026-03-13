import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import PairedMenus from "../../../src/components/shared/PairedMenus";

const inputListSetting = {
  key: "input",
  label: "Input List",
  default: ["a", "b", "c"],
  options: [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "c", label: "C" },
    { key: "d", label: "D" },
    { key: "e", label: "E" },
  ],
  paired: "dropdown",
};

const dropdownSetting = {
  key: "dropdown",
  label: "Dropdown",
  default: "b",
  options: [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "c", label: "C" },
    { key: "d", label: "D" },
    { key: "e", label: "E" },
  ],
  type: "select",
};

function renderPairedMenus(
  overrides: Partial<React.ComponentProps<typeof PairedMenus>> = {}
) {
  const props = {
    inputListSetting,
    dropdownSetting,
    disabled: false,
    ...overrides,
  };
  return render(<PairedMenus {...props} />);
}

/** Returns the dropdown `<select>` by name attribute. */
const getDropdown = () =>
  document.querySelector<HTMLSelectElement>("select[name='dropdown']");

describe("PairedMenus", () => {
  // ─── Structure ──────────────────────────────────────────────────────────────

  it("renders a fieldset", () => {
    renderPairedMenus();
    expect(document.querySelector("fieldset")).toBeInTheDocument();
  });

  it("renders a dropdown select with name='dropdown'", () => {
    renderPairedMenus();
    expect(getDropdown()).toBeInTheDocument();
  });

  it("renders an input-list for the InputList setting", () => {
    renderPairedMenus();
    expect(document.querySelector(".input-list")).toBeInTheDocument();
  });

  // ─── Initial values ─────────────────────────────────────────────────────────

  it("initialises dropdown value from dropdownSetting.default", () => {
    renderPairedMenus();
    expect(getDropdown().value).toBe("b");
  });

  it("dropdown options match the default inputList values (A, B, C)", () => {
    renderPairedMenus();
    const dropdown = getDropdown();
    const optionTexts = Array.from(dropdown.options).map((o) => o.text);
    expect(optionTexts).toEqual(["A", "B", "C"]);
  });

  // ─── item prop ──────────────────────────────────────────────────────────────

  it("uses item.settings values when item prop is provided", () => {
    const item = {
      name: "Library",
      short_name: "lib",
      uuid: "123",
      settings: { input: ["c", "d", "e"], dropdown: "d" },
    };
    renderPairedMenus({ item });

    // Dropdown value comes from item.settings.dropdown
    expect(getDropdown().value).toBe("d");

    // Dropdown options reflect item.settings.input
    const optionTexts = Array.from(getDropdown().options).map((o) => o.text);
    expect(optionTexts).toEqual(["C", "D", "E"]);
  });

  // ─── Warning when no dropdown options ────────────────────────────────────────

  it("shows warning message and hides dropdown when inputList is empty", () => {
    const emptyInputListSetting = {
      ...inputListSetting,
      default: [],
    };
    renderPairedMenus({ inputListSetting: emptyInputListSetting });

    expect(
      screen.getByText(
        "In order to set this value, you must add at least one option from the menu above."
      )
    ).toBeInTheDocument();
    expect(getDropdown()).toBeNull();
  });

  // ─── readOnly ────────────────────────────────────────────────────────────────

  it("disables the InputList Add button when readOnly is true", () => {
    renderPairedMenus({ readOnly: true });
    const addButton = screen.getByText("Add");
    expect(addButton.closest("button")).toBeDisabled();
  });

  it("does not disable Add button when readOnly is false", () => {
    renderPairedMenus({ readOnly: false });
    // Add button is disabled only if disableButton || no new value typed
    // With type="menu", button is disabled only from disableButton
    const addButton = screen.getByText("Add");
    expect(addButton.closest("button")).not.toBeDisabled();
  });

  // ─── Dynamic dropdown options ────────────────────────────────────────────────

  it("dropdown options update when inputList items are removed", async () => {
    renderPairedMenus();

    // Initially: A, B, C
    expect(Array.from(getDropdown().options).map((o) => o.text)).toEqual([
      "A",
      "B",
      "C",
    ]);

    // Delete the first item ("A") then the new first item ("B")
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    });

    // Now only C should be available in the dropdown
    expect(Array.from(getDropdown().options).map((o) => o.text)).toEqual(["C"]);
  });

  it("shows warning when all inputList items are deleted", async () => {
    renderPairedMenus();
    // Delete all 3 items one by one
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    });

    expect(
      screen.getByText(
        "In order to set this value, you must add at least one option from the menu above."
      )
    ).toBeInTheDocument();
    expect(getDropdown()).toBeNull();
  });

  // ─── Dropdown change ─────────────────────────────────────────────────────────

  it("responds to dropdown value change", () => {
    renderPairedMenus();
    const dropdown = getDropdown();
    fireEvent.change(dropdown, { target: { value: "c" } });
    expect(dropdown.value).toBe("c");
  });
});
