import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Contributors from "../../../src/components/Contributors";
import { RolesData, ContributorData } from "../../../src/interfaces";

const roles: RolesData = {
  aut: "Author",
  ill: "Illustrator",
  nrt: "Narrator",
  trl: "Translator",
};

const contributors: ContributorData[] = [
  { name: "A Translator", role: "trl" },
  { name: "A Narrator", role: "nrt" },
];

const renderContributors = (
  props: Partial<React.ComponentProps<typeof Contributors>> = {}
) =>
  render(
    <Contributors
      roles={roles}
      contributors={contributors}
      disabled={false}
      {...props}
    />
  );

const existingRows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".with-remove-button"));

const newContributorForm = () =>
  screen
    .getByRole("button", { name: "Add" })
    .closest(".contributor-form") as HTMLElement;

const roleSelect = (row: HTMLElement) =>
  row.querySelector('select[name="contributor-role"]') as HTMLSelectElement;
const nameInput = (row: HTMLElement) =>
  row.querySelector('input[name="contributor-name"]') as HTMLInputElement;

describe("Contributors", () => {
  it("displays a label", () => {
    renderContributors();
    expect(screen.getByText("Authors and Contributors")).toBeInTheDocument();
  });

  it("displays a list of existing contributors", () => {
    const { container } = renderContributors();
    const rows = existingRows(container);
    expect(rows).toHaveLength(2);

    expect(roleSelect(rows[0])).toHaveValue("Translator");
    expect(nameInput(rows[0])).toHaveValue("A Translator");
    expect(roleSelect(rows[1])).toHaveValue("Narrator");
    expect(nameInput(rows[1])).toHaveValue("A Narrator");

    // Each role menu offers the full set of roles.
    const options = within(roleSelect(rows[0]))
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);
    expect(options).toStrictEqual(Object.values(roles));
  });

  it("displays a blank field for adding a new contributor", () => {
    renderContributors();
    const form = newContributorForm();
    expect(roleSelect(form)).toHaveValue("Author");
    expect(nameInput(form)).toHaveValue("");

    const button = within(form).getByRole("button", { name: "Add" });
    expect(button).toHaveClass("add-contributor");
  });

  it("deletes a contributor", async () => {
    const user = userEvent.setup();
    const { container } = renderContributors();

    let rows = existingRows(container);
    expect(rows).toHaveLength(2);

    // Remove the first (Translator) row.
    await user.click(within(rows[0]).getByRole("button"));

    rows = existingRows(container);
    expect(rows).toHaveLength(1);
    expect(roleSelect(rows[0])).toHaveValue("Narrator");
    expect(nameInput(rows[0])).toHaveValue("A Narrator");
  });

  it("adds a contributor", async () => {
    const user = userEvent.setup();
    const { container } = renderContributors();
    expect(existingRows(container)).toHaveLength(2);

    const form = newContributorForm();
    await user.selectOptions(roleSelect(form), "Illustrator");
    await user.type(nameInput(form), "An Illustrator");
    await user.click(within(form).getByRole("button", { name: "Add" }));

    const rows = existingRows(container);
    expect(rows).toHaveLength(3);
    expect(roleSelect(rows[2])).toHaveValue("Illustrator");
    expect(nameInput(rows[2])).toHaveValue("An Illustrator");
  });

  it("does not add an empty string as a contributor's name", async () => {
    const user = userEvent.setup();
    const { container } = renderContributors();

    // The Add button starts disabled, so clicking it does nothing.
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(existingRows(container)).toHaveLength(2);

    // Typing a name enables the button and lets us add.
    await user.type(nameInput(newContributorForm()), "An Author");
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(existingRows(container)).toHaveLength(3);

    // Clearing the name disables the button again.
    await user.clear(nameInput(newContributorForm()));
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(existingRows(container)).toHaveLength(3);
  });

  it("shows the full name of a contributor's known role", () => {
    // "trl" and "nrt" resolve to their full names in the role menus.
    const { container } = renderContributors();
    const rows = existingRows(container);
    expect(roleSelect(rows[0])).toHaveValue("Translator");
    expect(roleSelect(rows[1])).toHaveValue("Narrator");
  });

  it("resets the form after adding a contributor", async () => {
    const user = userEvent.setup();
    renderContributors();

    const form = newContributorForm();
    await user.selectOptions(roleSelect(form), "Illustrator");
    await user.type(nameInput(form), "An Illustrator");
    await user.click(within(form).getByRole("button", { name: "Add" }));

    // The add form is blank again, defaulted to "Author", with a disabled button.
    const resetForm = newContributorForm();
    expect(nameInput(resetForm)).toHaveValue("");
    expect(roleSelect(resetForm)).toHaveValue("Author");
    expect(
      within(resetForm).getByRole("button", { name: "Add" })
    ).toBeDisabled();
  });
});
