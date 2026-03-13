import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Contributors from "../../../src/components/book/Contributors";
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

function renderContributors(props = {}) {
  return render(
    <Contributors
      roles={roles}
      contributors={contributors}
      disabled={false}
      {...props}
    />
  );
}

describe("Contributors", () => {
  it("displays a label", () => {
    renderContributors();
    expect(screen.getByText("Authors and Contributors")).toBeInTheDocument();
  });

  it("displays a list of existing contributors", () => {
    const { container } = renderContributors();
    const removables = container.querySelectorAll(".with-remove-button");
    expect(removables.length).toBe(2);

    // First contributor: Translator
    const firstSelect = removables[0].querySelector("select");
    expect(firstSelect.getAttribute("name")).toBe("contributor-role");
    expect(firstSelect.value).toBe("Translator");
    const firstInput = removables[0].querySelector("input");
    expect(firstInput.getAttribute("name")).toBe("contributor-name");
    expect(firstInput.value).toBe("A Translator");

    // Second contributor: Narrator
    const secondSelect = removables[1].querySelector("select");
    expect(secondSelect.value).toBe("Narrator");
    const secondInput = removables[1].querySelector("input");
    expect(secondInput.value).toBe("A Narrator");
  });

  it("displays a blank field for adding a new contributor", () => {
    const { container } = renderContributors();
    const forms = container.querySelectorAll(".contributor-form");
    const newForm = forms[forms.length - 1];

    const select = newForm.querySelector("select");
    expect(select.getAttribute("name")).toBe("contributor-role");
    expect(select.value).toBe("Author");

    const input = newForm.querySelector("input");
    expect(input.getAttribute("name")).toBe("contributor-name");
    expect(input.value).toBe("");

    const addButton = newForm.querySelector(".add-contributor");
    expect(addButton).not.toBeNull();
    expect(addButton.textContent).toBe("Add");
  });

  it("selects have all the role options", () => {
    const { container } = renderContributors();
    const selects = container.querySelectorAll(
      "select[name='contributor-role']"
    );
    selects.forEach((select) => {
      const options = Array.from(select.querySelectorAll("option")).map(
        (o) => (o as HTMLOptionElement).value
      );
      expect(options).toEqual(Object.values(roles));
    });
  });

  it("deletes a contributor", () => {
    const { container } = renderContributors();
    let removables = container.querySelectorAll(".with-remove-button");
    expect(removables.length).toBe(2);

    // Click the remove button on the first contributor
    const removeButton = removables[0].querySelector("button");
    fireEvent.click(removeButton);

    removables = container.querySelectorAll(".with-remove-button");
    expect(removables.length).toBe(1);
    const remainingInput = removables[0].querySelector("input");
    expect(remainingInput.value).toBe("A Narrator");
  });

  it("adds a contributor", () => {
    const { container } = renderContributors();
    const forms = container.querySelectorAll(".contributor-form");
    const newForm = forms[forms.length - 1];

    const select = newForm.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "Illustrator" } });

    const input = newForm.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "An Illustrator" } });

    const addButton = newForm.querySelector(".add-contributor");
    fireEvent.click(addButton);

    const removables = container.querySelectorAll(".with-remove-button");
    expect(removables.length).toBe(3);
    const lastRemovable = removables[2];
    const lastSelect = lastRemovable.querySelector(
      "select"
    ) as HTMLSelectElement;
    const lastInput = lastRemovable.querySelector("input") as HTMLInputElement;
    expect(lastSelect.value).toBe("Illustrator");
    expect(lastInput.value).toBe("An Illustrator");
  });

  it("does not add a contributor with an empty name", () => {
    const { container } = renderContributors();
    const forms = container.querySelectorAll(".contributor-form");
    const newForm = forms[forms.length - 1];
    const addButton = newForm.querySelector(".add-contributor");

    // Button is disabled initially
    expect(addButton).toBeDisabled();
    fireEvent.click(addButton);

    // Still 2 contributors
    expect(container.querySelectorAll(".with-remove-button").length).toBe(2);

    // Type a name — button should become enabled
    const input = newForm.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "An Author" } });
    expect(addButton).not.toBeDisabled();

    fireEvent.click(addButton);
    expect(container.querySelectorAll(".with-remove-button").length).toBe(3);

    // Clear the name — button disabled again
    fireEvent.change(input, { target: { value: "" } });
    expect(addButton).toBeDisabled();
  });

  it("resets the form after adding a contributor", () => {
    const { container } = renderContributors();
    const forms = container.querySelectorAll(".contributor-form");
    const newForm = forms[forms.length - 1];

    const select = newForm.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "Illustrator" } });
    const input = newForm.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "An Illustrator" } });
    const addButton = newForm.querySelector(".add-contributor");
    fireEvent.click(addButton);

    // After adding, the new-contributor form should be reset
    const allForms = container.querySelectorAll(".contributor-form");
    const resetForm = allForms[allForms.length - 1];
    const resetInput = resetForm.querySelector("input") as HTMLInputElement;
    const resetSelect = resetForm.querySelector("select") as HTMLSelectElement;
    expect(resetInput.value).toBe("");
    expect(resetSelect.value).toBe("Author");
    expect(resetForm.querySelector(".add-contributor")).toBeDisabled();
  });
});
