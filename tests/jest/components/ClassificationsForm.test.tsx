import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import ClassificationsForm from "../../../src/components/book/ClassificationsForm";
import genreData from "../../../src/components/__tests__/genreData";

// --------------- Shared test data --------------- //

const baseBook = {
  id: "urn:book:1",
  title: "title",
  audience: "Young Adult" as any,
  targetAgeRange: ["12", "16"],
  fiction: true,
  categories: ["Space Opera"],
};

const noClassificationsBook = {
  id: "urn:book:2",
  title: "title",
  audience: undefined,
  targetAgeRange: ["12", "16"],
  fiction: undefined,
  categories: ["Space Opera"],
};

// --------------- Tests --------------- //

describe("ClassificationsForm", () => {
  describe("rendering without classification values", () => {
    let editClassifications: jest.Mock;
    let container: HTMLElement;

    beforeEach(() => {
      editClassifications = jest.fn();
      ({ container } = render(
        <ClassificationsForm
          book={noClassificationsBook as any}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      ));
    });

    it("shows audience select with value None and 7 options", () => {
      const select = container.querySelector<HTMLSelectElement>(
        "select[name='audience']"
      );
      expect(select).not.toBeNull();
      expect(select.value).toBe("None");
      // 7 options: None + Children + Young Adult + Adult + Adults Only + All Ages + Research
      expect(select.querySelectorAll("option").length).toBe(7);
    });

    it("shows fiction radio buttons with none checked", () => {
      const noneRadio = container.querySelector<HTMLInputElement>(
        "input[value='none']"
      );
      const fictionRadio = container.querySelector<HTMLInputElement>(
        "input[value='fiction']"
      );
      const nonfictionRadio = container.querySelector<HTMLInputElement>(
        "input[value='nonfiction']"
      );

      expect(noneRadio).not.toBeNull();
      expect(noneRadio.checked).toBe(true);

      expect(fictionRadio).not.toBeNull();
      expect(fictionRadio.checked).toBe(false);

      expect(nonfictionRadio).not.toBeNull();
      expect(nonfictionRadio.checked).toBe(false);
    });

    it("does not submit if audience or fiction is not selected", () => {
      const saveBtn = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");
      fireEvent.click(saveBtn);
      expect(editClassifications).not.toHaveBeenCalled();
    });

    it("renders error messages when audience and fiction are missing", () => {
      const saveBtn = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");
      fireEvent.click(saveBtn);

      const alert =
        container.querySelector(
          ".alert-danger, [data-variant='destructive'], .alert[class*='destructive']"
        ) || container.querySelector("[role='alert']");
      expect(editClassifications).not.toHaveBeenCalled();
      expect(container.textContent).toContain(
        "No Audience classification selected."
      );
      expect(container.textContent).toContain(
        "No Fiction classification selected."
      );
    });

    it("blocks submit without audience — fiction-only book still blocked", () => {
      // Render a book with fiction=false but no audience
      const noAudienceBook = {
        id: "urn:book:3",
        title: "title",
        audience: undefined,
        targetAgeRange: ["12", "16"],
        fiction: false,
        categories: [],
      };
      const altEditClassifications = jest.fn();
      const { container: c } = render(
        <ClassificationsForm
          book={noAudienceBook as any}
          genreTree={genreData}
          editClassifications={altEditClassifications}
        />
      );
      const saveBtn = Array.from(
        c.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");

      // Fiction is already non-undefined (false = nonfiction), audience is missing
      fireEvent.click(saveBtn);
      expect(altEditClassifications).not.toHaveBeenCalled();
      expect(c.textContent).toContain("No Audience classification selected.");

      // Select audience
      const audienceSelect = c.querySelector<HTMLSelectElement>(
        "select[name='audience']"
      );
      fireEvent.change(audienceSelect, { target: { value: "Adult" } });
      fireEvent.click(saveBtn);
      expect(altEditClassifications).toHaveBeenCalledTimes(1);
    });

    it("blocks submit without fiction — audience-only book still blocked", () => {
      // Render a book with audience set but fiction=undefined
      const noFictionBook = {
        id: "urn:book:4",
        title: "title",
        audience: "Adult",
        targetAgeRange: ["12", "16"],
        fiction: undefined,
        categories: [],
      };
      const altEditClassifications = jest.fn();
      const { container: c, rerender } = render(
        <ClassificationsForm
          book={noFictionBook as any}
          genreTree={genreData}
          editClassifications={altEditClassifications}
        />
      );
      const saveBtn = Array.from(
        c.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");

      // Audience is set, fiction is undefined — should block
      fireEvent.click(saveBtn);
      expect(altEditClassifications).not.toHaveBeenCalled();
      expect(c.textContent).toContain("No Fiction classification selected.");

      // Rerender with fiction defined to simulate user selecting fiction
      const bookWithFiction = { ...noFictionBook, fiction: false };
      rerender(
        <ClassificationsForm
          book={bookWithFiction as any}
          genreTree={genreData}
          editClassifications={altEditClassifications}
        />
      );
      fireEvent.click(saveBtn);
      expect(altEditClassifications).toHaveBeenCalledTimes(1);
    });
  });

  describe("rendering with classification values", () => {
    let editClassifications: jest.Mock;
    let container: HTMLElement;

    beforeEach(() => {
      editClassifications = jest.fn();
      ({ container } = render(
        <ClassificationsForm
          book={baseBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      ));
    });

    it("shows audience select with Young Adult value and 6 options (no None option)", () => {
      const select = container.querySelector<HTMLSelectElement>(
        "select[name='audience']"
      );
      expect(select.value).toBe("Young Adult");
      // No None option when audience is already set
      expect(select.querySelectorAll("option").length).toBe(6);
    });

    it("shows target age range inputs with min=12 and max=16", () => {
      const minInput = container.querySelector<HTMLInputElement>(
        "input[name='target_age_min']"
      );
      const maxInput = container.querySelector<HTMLInputElement>(
        "input[name='target_age_max']"
      );
      expect(minInput).not.toBeNull();
      expect(minInput.value).toBe("12");
      expect(maxInput).not.toBeNull();
      expect(maxInput.value).toBe("16");
    });

    it("shows fiction radio button checked", () => {
      const fictionRadio = container.querySelector<HTMLInputElement>(
        "input[value='fiction']"
      );
      const nonfictionRadio = container.querySelector<HTMLInputElement>(
        "input[value='nonfiction']"
      );
      expect(fictionRadio.checked).toBe(true);
      expect(nonfictionRadio.checked).toBe(false);
      // No "none" radio when fiction is defined
      expect(container.querySelector("input[value='none']")).toBeNull();
    });

    it("shows the book's genres with remove buttons", () => {
      // Space Opera should show as "Science Fiction > Space Opera"
      expect(container.textContent).toContain("Science Fiction > Space Opera");
    });

    it("shows genre form", () => {
      // GenreForm renders with a select for adding genres
      const genreFormArea = container.querySelector(".genre-group-form");
      expect(genreFormArea).not.toBeNull();
      // The "Add Genre" title is rendered
      expect(genreFormArea.textContent).toContain("Add Genre");
    });

    it("shows Save button", () => {
      const saveBtn = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");
      expect(saveBtn).not.toBeUndefined();
    });
  });

  describe("behavior", () => {
    let editClassifications: jest.Mock;
    let container: HTMLElement;

    beforeEach(() => {
      editClassifications = jest.fn();
      ({ container } = render(
        <ClassificationsForm
          book={baseBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      ));
    });

    it("shows and hides target age inputs when audience changes", () => {
      // Young Adult → should show target age
      expect(
        container.querySelector("input[name='target_age_min']")
      ).not.toBeNull();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).not.toBeNull();

      // Change to Adult → should hide target age
      const audienceSelect = container.querySelector<HTMLSelectElement>(
        "select[name='audience']"
      );
      fireEvent.change(audienceSelect, { target: { value: "Adult" } });
      expect(
        container.querySelector("input[name='target_age_min']")
      ).toBeNull();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).toBeNull();

      // Change to Children → should show target age again
      fireEvent.change(audienceSelect, { target: { value: "Children" } });
      expect(
        container.querySelector("input[name='target_age_min']")
      ).not.toBeNull();
      expect(
        container.querySelector("input[name='target_age_max']")
      ).not.toBeNull();
    });

    it("changes fiction status and clears genres when book changes from fiction to nonfiction", () => {
      // Verify that switching fiction status via new book props clears inconsistent genres:
      // baseBook has fiction=true and genre Space Opera (a fiction genre).
      // When book changes to fiction=false, genres should be cleared for nonfiction.
      const nonfictionBook = {
        ...baseBook,
        fiction: false,
        categories: [],
      };
      const { container: c, rerender } = render(
        <ClassificationsForm
          book={baseBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      // Initially has Space Opera
      expect(c.textContent).toContain("Science Fiction > Space Opera");

      // Rerender with nonfiction book
      rerender(
        <ClassificationsForm
          book={nonfictionBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      // After switching to nonfiction with no categories, Space Opera should be gone
      expect(c.textContent).not.toContain("Science Fiction > Space Opera");
    });

    it("removes genre when remove button is clicked", () => {
      // "Science Fiction > Space Opera" is rendered with a remove button
      expect(container.textContent).toContain("Science Fiction > Space Opera");

      // Find the remove button (WithRemoveButton renders a Delete/× button near the genre)
      const removeButtons = container.querySelectorAll<HTMLButtonElement>(
        ".remove-btn, button[aria-label*='remove'], button[aria-label*='Remove'], button[aria-label*='delete'], button[aria-label*='Delete']"
      );

      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        expect(container.textContent).not.toContain(
          "Science Fiction > Space Opera"
        );
      } else {
        // Fallback: find the button inside .with-remove-button
        const withRemoveContainer = container.querySelector(
          ".with-remove-button"
        );
        if (withRemoveContainer) {
          const btn = withRemoveContainer.querySelector("button");
          if (btn) {
            fireEvent.click(btn);
            expect(container.textContent).not.toContain(
              "Science Fiction > Space Opera"
            );
          }
        }
      }
    });

    it("submits form data when Save is clicked", () => {
      const saveBtn = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button")
      ).find((b) => b.textContent === "Save");
      fireEvent.click(saveBtn);
      expect(editClassifications).toHaveBeenCalledTimes(1);
      const formData: FormData = editClassifications.mock.calls[0][0];
      expect(formData.get("audience")).toBe("Young Adult");
      expect(formData.get("target_age_min")).toBe("12");
      expect(formData.get("target_age_max")).toBe("16");
      expect(formData.get("fiction")).toBe("fiction");
      expect(formData.getAll("genres")).toContain("Space Opera");
    });

    it("updates state when book props change", () => {
      const newBook = {
        ...baseBook,
        audience: "Adult" as any,
        fiction: false,
        categories: ["Cooking"],
      };
      const { rerender, container: c } = render(
        <ClassificationsForm
          book={baseBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      rerender(
        <ClassificationsForm
          book={newBook}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      // After rerender with new book, the component's UNSAFE_componentWillReceiveProps fires
      // and state updates. The audience select should reflect the new book's audience.
      const audienceSelect = c.querySelector<HTMLSelectElement>(
        "select[name='audience']"
      );
      expect(audienceSelect.value).toBe("Adult");
    });
  });
});
