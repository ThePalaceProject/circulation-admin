import * as React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PairedMenus from "../../../src/components/PairedMenus";
import { SettingData, LibraryData } from "../../../src/interfaces";

describe("PairedMenus", () => {
  const inputListSetting: SettingData = {
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
  const dropdownSetting: SettingData = {
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

  const renderPairedMenus = (props = {}) =>
    render(
      <PairedMenus
        inputListSetting={inputListSetting}
        dropdownSetting={dropdownSetting}
        disabled={false}
        {...props}
      />
    );

  // The current InputList items are rendered as read-only text inputs inside the
  // `.input-list-ul` list; return their displayed values.
  const listItemValues = (container: HTMLElement): string[] =>
    within(container.querySelector<HTMLElement>(".input-list-ul")!)
      .getAllByRole("textbox")
      .map((input) => (input as HTMLInputElement).value);

  const dropdown = (container: HTMLElement): HTMLSelectElement =>
    container.querySelector<HTMLSelectElement>('select[name="dropdown"]')!;

  it("renders a fieldset with an InputList and a dropdown", () => {
    const { container } = renderPairedMenus();
    expect(
      container.querySelector("fieldset.paired-menus")
    ).toBeInTheDocument();
    expect(container.querySelector(".input-list")).toBeInTheDocument();
    expect(dropdown(container)).toBeInTheDocument();
  });

  it("renders the InputList items as read-only fields", () => {
    const { container } = renderPairedMenus();
    const listItems = within(
      container.querySelector<HTMLElement>(".input-list-ul")!
    ).getAllByRole("textbox");
    expect(listItems).toHaveLength(3);
    listItems.forEach((input) =>
      expect((input as HTMLInputElement).readOnly).toBe(true)
    );
    expect(listItemValues(container)).toEqual(["A", "B", "C"]);
  });

  it("renders the dropdown with its default value and available options", () => {
    const { container } = renderPairedMenus();
    const select = dropdown(container);
    expect(select).toHaveValue("b");
    const options = within(select).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["A", "B", "C"]);
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("optionally disables the InputList's button", () => {
    const { rerender } = renderPairedMenus();
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();

    rerender(
      <PairedMenus
        inputListSetting={inputListSetting}
        dropdownSetting={dropdownSetting}
        disabled={false}
        readOnly={true}
      />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("reflects the default InputList values and dropdown value", () => {
    const { container } = renderPairedMenus();
    expect(listItemValues(container)).toEqual(["A", "B", "C"]);
    expect(dropdown(container)).toHaveValue("b");
  });

  it("takes an optional item prop", () => {
    const item: LibraryData = {
      name: "Library",
      short_name: "lib",
      uuid: "123",
      settings: {
        input: ["c", "d", "e"],
        dropdown: "d",
      },
    };
    const { container } = renderPairedMenus({ item });

    const listItems = within(
      container.querySelector<HTMLElement>(".input-list-ul")!
    ).getAllByRole("textbox");
    expect(listItems.map((i) => (i as HTMLInputElement).value)).toEqual([
      "C",
      "D",
      "E",
    ]);
    expect(listItems.map((i) => (i as HTMLInputElement).name)).toEqual([
      "input_c",
      "input_d",
      "input_e",
    ]);

    const select = dropdown(container);
    expect(select).toHaveValue("d");
    expect(
      within(select)
        .getAllByRole("option")
        .map((o) => o.textContent)
    ).toEqual(["C", "D", "E"]);
  });

  it("updates the InputList when an item is removed", async () => {
    const { container } = renderPairedMenus();
    expect(listItemValues(container)).toEqual(["A", "B", "C"]);

    // Remove the first list item ("A").
    await userEvent.click(screen.getAllByRole("button", { name: /Delete/ })[0]);

    await waitFor(() =>
      expect(
        within(
          container.querySelector<HTMLElement>(".input-list-ul")!
        ).getAllByRole("textbox")
      ).toHaveLength(2)
    );
    expect(listItemValues(container)).toEqual(["B", "C"]);
  });

  it("recalculates the dropdown options based on the InputList values", async () => {
    const { container } = renderPairedMenus();
    expect(
      within(dropdown(container))
        .getAllByRole("option")
        .map((o) => o.textContent)
    ).toEqual(["A", "B", "C"]);

    // Removing "A" leaves the InputList holding [b, c], so the dropdown may only
    // offer B and C.
    await userEvent.click(screen.getAllByRole("button", { name: /Delete/ })[0]);

    await waitFor(() =>
      expect(
        within(dropdown(container))
          .getAllByRole("option")
          .map((o) => o.textContent)
      ).toEqual(["B", "C"])
    );
  });

  it("updates the dropdown selection", async () => {
    const { container } = renderPairedMenus();
    const select = dropdown(container);
    expect(select).toHaveValue("b");

    await userEvent.selectOptions(select, "c");
    expect(select).toHaveValue("c");
  });

  it("displays a message when the dropdown has no available values", async () => {
    const { container } = renderPairedMenus();

    // Remove every item from the InputList.
    for (let remaining = 3; remaining > 0; remaining--) {
      const removeButtons = screen.getAllByRole("button", { name: /Delete/ });
      expect(removeButtons).toHaveLength(remaining);
      await userEvent.click(removeButtons[0]);
      await waitFor(() =>
        expect(
          screen.queryAllByRole("button", { name: /Delete/ })
        ).toHaveLength(remaining - 1)
      );
    }

    const message =
      "In order to set this value, you must add at least one option from the menu above.";
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(container.querySelector(".bg-warning")).toHaveTextContent(message);

    // The dropdown select is replaced by the warning; only the add menu remains.
    expect(dropdown(container)).not.toBeInTheDocument();
    expect(container.querySelectorAll("select")).toHaveLength(1);
  });
});
