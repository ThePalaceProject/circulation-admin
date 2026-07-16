import * as React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ClassificationsForm from "../../../src/components/ClassificationsForm";
import { BookData } from "../../../src/interfaces";
import genreData from "../../../src/components/__tests__/genreData";

// ClassificationsForm is a plain (unconnected) class component, so a bare
// `render` is enough — no store/context/router needed.

const noValuesBook = (): BookData => ({
  id: "1",
  title: "title",
  audience: undefined,
  targetAgeRange: ["12", "16"],
  fiction: undefined,
  categories: ["Space Opera"],
});

const fullBook = (): BookData => ({
  id: "1",
  title: "title",
  audience: "Young Adult",
  targetAgeRange: ["12", "16"],
  fiction: true,
  categories: ["Space Opera"],
});

type RenderProps = Partial<React.ComponentProps<typeof ClassificationsForm>>;

const renderForm = (book: BookData, props: RenderProps = {}) => {
  const editClassifications = jest.fn();
  const result = render(
    <ClassificationsForm
      book={book}
      genreTree={genreData}
      editClassifications={editClassifications}
      {...props}
    />
  );
  return { ...result, editClassifications };
};

const audienceSelect = (container: HTMLElement) =>
  container.querySelector<HTMLSelectElement>("select[name='audience']");
const fictionRadio = (container: HTMLElement, value: string) =>
  container.querySelector<HTMLInputElement>(
    `input[name='fiction'][value='${value}']`
  );
const removeButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".with-remove-button"));

// Selects a top-level genre in the GenreForm and clicks "Add".
const addGenre = async (container: HTMLElement, genre: string) => {
  const user = userEvent.setup();
  const option = container.querySelector<HTMLOptionElement>(
    `select[name='genre'] option[value='${genre}']`
  );
  fireEvent.click(option);
  await user.click(screen.getByRole("button", { name: "Add" }));
};

// Selects a genre + subgenre in the GenreForm and clicks "Add".
const addSubgenre = async (
  container: HTMLElement,
  genre: string,
  subgenre: string
) => {
  const user = userEvent.setup();
  fireEvent.click(
    container.querySelector<HTMLOptionElement>(
      `select[name='genre'] option[value='${genre}']`
    )
  );
  fireEvent.click(
    container.querySelector<HTMLOptionElement>(
      `select[name='subgenre'] option[value='${subgenre}']`
    )
  );
  await user.click(screen.getByRole("button", { name: "Add" }));
};

describe("ClassificationsForm", () => {
  let confirmSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("rendering without classification values", () => {
    it("shows no audience or fiction classification selected", () => {
      const { container } = renderForm(noValuesBook());

      const audience = audienceSelect(container);
      expect(screen.getByText("Audience")).toBeInTheDocument();
      expect(audience).toHaveValue("None");
      // The "None" option is only present when no audience is selected.
      expect(within(audience).getAllByRole("option")).toHaveLength(7);

      const none = fictionRadio(container, "none");
      const fiction = fictionRadio(container, "fiction");
      const nonfiction = fictionRadio(container, "nonfiction");

      expect(none).toHaveAttribute("type", "radio");
      expect(none).toBeChecked();
      expect(fiction).not.toBeChecked();
      expect(nonfiction).not.toBeChecked();

      const group = container.querySelector(".fiction-radio-input");
      expect(group).toHaveTextContent("None");
      expect(group).toHaveTextContent("Fiction");
      expect(group).toHaveTextContent("Nonfiction");
    });

    it("does not submit without an audience or fiction classification", async () => {
      const user = userEvent.setup();
      const { container, editClassifications } = renderForm(noValuesBook());

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).not.toHaveBeenCalled();
      expect(audienceSelect(container)).toHaveValue("None");
    });

    it("renders error messages without an audience or fiction classification", async () => {
      const user = userEvent.setup();
      const { container, editClassifications } = renderForm(noValuesBook());

      await user.click(screen.getByRole("button", { name: "Save" }));

      const alert = container.querySelector(".alert-danger");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("No Audience classification selected.");
      expect(alert).toHaveTextContent("No Fiction classification selected.");
      expect(editClassifications).not.toHaveBeenCalled();
    });

    it("moves focus to the error message so it is announced", () => {
      jest.useFakeTimers();
      // Watch the focus() call itself: the component focuses the alert on a
      // 500ms timer. Use fireEvent (not userEvent, which focuses the target it
      // clicks) so the only focus() we observe is the intended one.
      const focusSpy = jest.spyOn(HTMLElement.prototype, "focus");
      try {
        const { container } = renderForm(noValuesBook());

        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(focusSpy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);

        const alert = container.querySelector(".alert-danger");
        expect(focusSpy).toHaveBeenCalledTimes(1);
        expect(focusSpy.mock.instances[0]).toBe(alert);
      } finally {
        focusSpy.mockRestore();
        jest.useRealTimers();
      }
    });

    it("does not submit if you didn't select an audience", async () => {
      const user = userEvent.setup();
      const { container, editClassifications } = renderForm(noValuesBook());

      // Choose a fiction classification but leave the audience unset.
      await user.click(fictionRadio(container, "fiction"));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).not.toHaveBeenCalled();
      expect(container.querySelector(".alert-danger")).toBeInTheDocument();

      // Now choose an audience and the form submits, clearing the error.
      await user.selectOptions(audienceSelect(container), "Adult");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).toHaveBeenCalledTimes(1);
      expect(container.querySelector(".alert-danger")).not.toBeInTheDocument();
    });

    it("does not submit if you didn't select a fiction classification", async () => {
      const user = userEvent.setup();
      const { container, editClassifications } = renderForm(noValuesBook());

      // Choose an audience but leave the fiction classification unset.
      await user.selectOptions(audienceSelect(container), "Adult");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).not.toHaveBeenCalled();
      expect(fictionRadio(container, "nonfiction")).not.toBeChecked();

      // Now choose a fiction classification and the form submits.
      await user.click(fictionRadio(container, "nonfiction"));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).toHaveBeenCalledTimes(1);
    });
  });

  describe("rendering", () => {
    it("shows an editable select with audience options", () => {
      const { container } = renderForm(fullBook());

      const audience = audienceSelect(container);
      expect(screen.getByText("Audience")).toBeInTheDocument();
      expect(audience).toHaveValue("Young Adult");
      // The "None" option is not rendered once an audience is selected.
      expect(within(audience).getAllByRole("option")).toHaveLength(6);
    });

    it("shows editable inputs with min and max target age", () => {
      const { container } = renderForm(fullBook());

      expect(
        container.querySelector("input[name='target_age_min']")
      ).toHaveValue("12");
      expect(
        container.querySelector("input[name='target_age_max']")
      ).toHaveValue("16");
    });

    it("shows editable radio buttons with fiction status", () => {
      const { container } = renderForm(fullBook());

      // With a fiction value set, the "None" fiction radio is not rendered.
      expect(fictionRadio(container, "none")).toBeNull();
      expect(fictionRadio(container, "fiction")).toBeChecked();
      expect(fictionRadio(container, "nonfiction")).not.toBeChecked();

      const group = container.querySelector(".fiction-radio-input");
      expect(group).toHaveTextContent("Fiction");
      expect(group).toHaveTextContent("Nonfiction");
    });

    it("shows the book's full genres with remove buttons", () => {
      const { container } = renderForm(fullBook());

      const buttons = removeButtons(container);
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("Science Fiction > Space Opera");
      expect(
        within(buttons[0]).getByRole("button", { name: /Delete/ })
      ).toBeInTheDocument();
    });

    it("shows the book's full genres even if inconsistent with fiction status", () => {
      const editClassifications = jest.fn();
      const { container, rerender } = render(
        <ClassificationsForm
          book={fullBook()}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );

      rerender(
        <ClassificationsForm
          book={{ ...fullBook(), fiction: false }}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );

      const buttons = removeButtons(container);
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("Science Fiction > Space Opera");
    });

    it("shows a genre form", () => {
      const { container } = renderForm(fullBook());

      const genreSelect = container.querySelector("select[name='genre']");
      expect(genreSelect).toBeInTheDocument();
      expect(genreSelect).not.toBeDisabled();
      expect(screen.getByText("Add Genre")).toBeInTheDocument();
    });

    it("shows a submit button", () => {
      renderForm(fullBook());
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  describe("behavior", () => {
    it("shows and hides target age inputs when audience changes", async () => {
      const user = userEvent.setup();
      const { container } = renderForm(fullBook());

      expect(
        container.querySelector("input[name='target_age_min']")
      ).toBeInTheDocument();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).toBeInTheDocument();

      await user.selectOptions(audienceSelect(container), "Adult");
      expect(
        container.querySelector("input[name='target_age_min']")
      ).not.toBeInTheDocument();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).not.toBeInTheDocument();

      await user.selectOptions(audienceSelect(container), "Children");
      expect(
        container.querySelector("input[name='target_age_min']")
      ).toBeInTheDocument();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).toBeInTheDocument();
    });

    it("changes both fiction status radio buttons", async () => {
      const user = userEvent.setup();
      const { container } = renderForm(fullBook());

      expect(fictionRadio(container, "fiction")).toBeChecked();
      expect(fictionRadio(container, "nonfiction")).not.toBeChecked();

      // Switching to nonfiction prompts for confirmation and clears the
      // (fiction) genre.
      await user.click(fictionRadio(container, "nonfiction"));
      expect(confirmSpy).toHaveBeenCalled();
      expect(removeButtons(container)).toHaveLength(0);
      expect(fictionRadio(container, "fiction")).not.toBeChecked();
      expect(fictionRadio(container, "nonfiction")).toBeChecked();

      await user.click(fictionRadio(container, "fiction"));
      expect(fictionRadio(container, "fiction")).toBeChecked();
      expect(fictionRadio(container, "nonfiction")).not.toBeChecked();
    });

    it("adds a genre only after validating it against the audience", async () => {
      const { container } = renderForm(fullBook());

      expect(removeButtons(container)).toHaveLength(1);

      // Erotica is not allowed for a Young Adult audience: it is rejected with
      // an alert and not added.
      await addGenre(container, "Erotica");
      expect(alertSpy).toHaveBeenCalled();
      let buttons = removeButtons(container);
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).not.toHaveTextContent("Erotica");

      // Folklore is allowed and gets added.
      await addGenre(container, "Folklore");
      buttons = removeButtons(container);
      expect(buttons).toHaveLength(2);
      expect(buttons.some((b) => b.textContent.includes("Folklore"))).toBe(
        true
      );
    });

    it("removes a genre when its remove button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderForm(fullBook());

      const button = removeButtons(container)[0];
      await user.click(within(button).getByRole("button", { name: /Delete/ }));

      expect(removeButtons(container)).toHaveLength(0);
    });

    it("submits data when the submit button is clicked", async () => {
      const user = userEvent.setup();
      const { editClassifications } = renderForm(fullBook());

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(editClassifications).toHaveBeenCalledTimes(1);
      const data = editClassifications.mock.calls[0][0] as FormData;
      expect(data.get("audience")).toBe("Young Adult");
      expect(data.get("target_age_min")).toBe("12");
      expect(data.get("target_age_max")).toBe("16");
      expect(data.get("fiction")).toBe("fiction");
      expect(data.getAll("genres")).toEqual(["Space Opera"]);
    });

    it("updates state upon receiving new state-related props", () => {
      const editClassifications = jest.fn();
      const { container, rerender } = render(
        <ClassificationsForm
          book={fullBook()}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );

      rerender(
        <ClassificationsForm
          book={{
            ...fullBook(),
            audience: "Adult",
            fiction: false,
            categories: ["Cooking"],
          }}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );

      expect(audienceSelect(container)).toHaveValue("Adult");
      expect(fictionRadio(container, "nonfiction")).toBeChecked();
      expect(fictionRadio(container, "fiction")).not.toBeChecked();

      const buttons = removeButtons(container);
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("Food & Health > Cooking");
    });

    it("doesn't reset user edits upon receiving new state-unrelated props", async () => {
      const user = userEvent.setup();
      const editClassifications = jest.fn();
      const { container, rerender } = render(
        <ClassificationsForm
          book={fullBook()}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );

      // The user switches to nonfiction (clearing the fiction genre) and adds a
      // nonfiction genre.
      await user.click(fictionRadio(container, "nonfiction"));
      expect(fictionRadio(container, "nonfiction")).toBeChecked();
      expect(removeButtons(container)).toHaveLength(0);

      await addSubgenre(container, "Food & Health", "Cooking");
      expect(removeButtons(container)).toHaveLength(1);
      expect(container.querySelector(".with-remove-button")).toHaveTextContent(
        "Food & Health > Cooking"
      );

      // A re-render caused by an unrelated prop change (disabling the form on
      // submit) must not discard those edits.
      rerender(
        <ClassificationsForm
          book={fullBook()}
          genreTree={genreData}
          editClassifications={editClassifications}
          disabled={true}
        />
      );

      expect(fictionRadio(container, "nonfiction")).toBeChecked();
      expect(container.querySelector(".with-remove-button")).toHaveTextContent(
        "Food & Health > Cooking"
      );
    });
  });
});
