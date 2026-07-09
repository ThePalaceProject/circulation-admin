import * as React from "react";
import { installFormDataShim } from "../testUtils/formDataShim";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BookEditForm from "../../../src/components/BookEditForm";
import {
  BookData,
  RolesData,
  MediaData,
  LanguagesData,
} from "../../../src/interfaces";
installFormDataShim();

describe("BookEditForm", () => {
  const roles: RolesData = {
    aut: "Author",
    nar: "Narrator",
  };

  const media: MediaData = {
    "http://schema.org/AudioObject": "Audio",
    "http://schema.org/Book": "Book",
  };

  const languages: LanguagesData = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
  };

  const bookData: BookData = {
    id: "id",
    title: "title",
    subtitle: "subtitle",
    authors: [{ name: "An Author", role: "aut" }],
    contributors: [
      { name: "A Narrator", role: "nar" },
      { name: "Another Narrator", role: "nar" },
    ],
    fiction: true,
    audience: "Young Adult",
    targetAgeRange: ["12", "16"],
    summary: "summary",
    series: "series",
    seriesPosition: 3,
    medium: "http://schema.org/AudioObject",
    language: "eng",
    publisher: "publisher",
    imprint: "imprint",
    issued: "2017-04-03",
    rating: 4,
    editLink: {
      href: "href",
      rel: "edit",
    },
  };

  type Props = React.ComponentProps<typeof BookEditForm>;

  const makeProps = (overrides: Partial<Props> = {}): Props => ({
    ...(bookData as Props),
    roles,
    media,
    languages,
    disabled: false,
    refresh: jest.fn(),
    editBook: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const renderForm = (overrides: Partial<Props> = {}) => {
    const props = makeProps(overrides);
    const result = render(<BookEditForm {...props} />);
    const rerender = (nextOverrides: Partial<Props>) =>
      result.rerender(<BookEditForm {...makeProps(nextOverrides)} />);
    return { ...result, rerender, props };
  };

  const inputsByName = (container: HTMLElement, name: string) =>
    Array.from(
      container.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)
    );
  const selectsByName = (container: HTMLElement, name: string) =>
    Array.from(
      container.querySelectorAll<HTMLSelectElement>(`select[name="${name}"]`)
    );

  describe("rendering", () => {
    it("shows editable input with title", () => {
      const { container } = renderForm();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(container.querySelector('input[name="title"]')).toHaveValue(
        "title"
      );
    });

    it("shows editable input with subtitle", () => {
      const { container } = renderForm();
      expect(screen.getByText("Subtitle")).toBeInTheDocument();
      expect(container.querySelector('input[name="subtitle"]')).toHaveValue(
        "subtitle"
      );
    });

    it("shows authors and contributors", () => {
      const { container } = renderForm();

      const names = inputsByName(container, "contributor-name");
      const contributorRoles = selectsByName(container, "contributor-role");
      expect(names).toHaveLength(4);
      expect(contributorRoles).toHaveLength(4);

      expect(names[0]).toHaveValue("An Author");
      expect(contributorRoles[0]).toHaveValue("Author");
      expect(names[1]).toHaveValue("A Narrator");
      expect(contributorRoles[1]).toHaveValue("Narrator");
      expect(names[2]).toHaveValue("Another Narrator");
      expect(contributorRoles[2]).toHaveValue("Narrator");

      // The last inputs are for adding a new contributor.
      expect(names[3]).toHaveValue("");
      expect(contributorRoles[3]).toHaveValue("Author");
      expect(
        container.querySelector("button.add-contributor")
      ).toBeInTheDocument();

      // Existing authors and contributors are removable.
      expect(
        container.querySelectorAll(".with-remove-button .remove-btn")
      ).toHaveLength(3);

      // All role inputs have the same options.
      [contributorRoles[1], contributorRoles[3]].forEach((select) => {
        const options = within(select).getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveValue("Author");
        expect(options[1]).toHaveValue("Narrator");
      });
    });

    it("shows editable input with series", () => {
      const { container } = renderForm();
      expect(container.querySelector('input[name="series"]')).toHaveValue(
        "series"
      );
    });

    it("shows editable input with series position", () => {
      const { container } = renderForm();
      expect(
        container.querySelector('input[name="series_position"]')
      ).toHaveValue("3");
    });

    it("shows editable input with medium", () => {
      const { container } = renderForm();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(container.querySelector('select[name="medium"]')).toHaveValue(
        "Audio"
      );
    });

    it("shows a language field", () => {
      const { container, rerender } = renderForm();
      expect(screen.getByText("Language")).toBeInTheDocument();
      expect(container.querySelector('input[name="language"]')).toHaveValue(
        "English"
      );

      rerender({ language: "fre" });
      expect(container.querySelector('input[name="language"]')).toHaveValue(
        "fre"
      );
    });

    it("shows editable input with publisher", () => {
      const { container } = renderForm();
      expect(screen.getByText("Publisher")).toBeInTheDocument();
      expect(container.querySelector('input[name="publisher"]')).toHaveValue(
        "publisher"
      );
    });

    it("shows editable input with imprint", () => {
      const { container } = renderForm();
      expect(screen.getByText("Imprint")).toBeInTheDocument();
      expect(container.querySelector('input[name="imprint"]')).toHaveValue(
        "imprint"
      );
    });

    it("shows editable input with publication date", () => {
      const { container } = renderForm();
      expect(screen.getByText("Publication Date")).toBeInTheDocument();
      expect(container.querySelector('input[name="issued"]')).toHaveValue(
        "2017-04-03"
      );
    });

    it("shows editable input with rating", () => {
      const { container } = renderForm();
      expect(screen.getByText(/Rating/)).toBeInTheDocument();
      const rating = container.querySelector<HTMLInputElement>(
        'input[name="rating"]'
      );
      expect(rating).toHaveValue(4);
    });

    it("shows editable textarea with summary", () => {
      const { container } = renderForm();
      const editor = container.querySelector<HTMLElement>(".editor");
      expect(within(editor).getByText("Summary")).toBeInTheDocument();
      expect(editor.querySelector(".DraftEditor-root")).toHaveTextContent(
        "summary"
      );
    });
  });

  it("removes a contributor", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    let removeButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(removeButtons).toHaveLength(3);

    // Remove the first narrator (index 1: An Author, A Narrator, Another Narrator).
    await user.click(removeButtons[1]);

    removeButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(removeButtons).toHaveLength(2);

    const names = inputsByName(container, "contributor-name");
    const contributorRoles = selectsByName(container, "contributor-role");
    expect(names).toHaveLength(3);
    expect(contributorRoles).toHaveLength(3);
    expect(names[0]).toHaveValue("An Author");
    expect(contributorRoles[0]).toHaveValue("Author");
    expect(names[1]).toHaveValue("Another Narrator");
    expect(contributorRoles[1]).toHaveValue("Narrator");
    expect(names[2]).toHaveValue("");
    expect(contributorRoles[2]).toHaveValue("Author");
  });

  it("adds a contributor", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    let names = inputsByName(container, "contributor-name");
    let contributorRoles = selectsByName(container, "contributor-role");
    expect(names).toHaveLength(4);
    expect(contributorRoles).toHaveLength(4);

    // Fill in the empty "add" name field (the last one); its role defaults to
    // Author. Typing enables the Add button.
    await user.type(names[3], "New Author");
    await user.click(container.querySelector("button.add-contributor"));

    names = inputsByName(container, "contributor-name");
    contributorRoles = selectsByName(container, "contributor-role");
    expect(names).toHaveLength(5);
    expect(contributorRoles).toHaveLength(5);

    expect(names[0]).toHaveValue("An Author");
    expect(contributorRoles[0]).toHaveValue("Author");
    expect(names[1]).toHaveValue("A Narrator");
    expect(contributorRoles[1]).toHaveValue("Narrator");
    expect(names[2]).toHaveValue("Another Narrator");
    expect(contributorRoles[2]).toHaveValue("Narrator");
    expect(names[3]).toHaveValue("New Author");
    expect(contributorRoles[3]).toHaveValue("Author");
    expect(names[4]).toHaveValue("");
    expect(contributorRoles[4]).toHaveValue("Author");
  });

  it("calls editBook on submit", async () => {
    const user = userEvent.setup();
    const editBook = jest.fn().mockResolvedValue(undefined);
    renderForm({ editBook });

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(editBook).toHaveBeenCalledTimes(1);
    const [url, data] = editBook.mock.calls[0];
    expect(url).toBe("href");
    expect(data.get("title")).toBe(bookData.title);
    expect(data.get("subtitle")).toBe(bookData.subtitle);

    // The last contributor field is the empty one for adding a new contributor.
    // If the user had filled it in without clicking "Add", it would still be
    // submitted.
    expect(data.getAll("contributor-name")).toStrictEqual([
      "An Author",
      "A Narrator",
      "Another Narrator",
      "",
    ]);
    expect(data.getAll("contributor-role")).toStrictEqual([
      "Author",
      "Narrator",
      "Narrator",
      "Author",
    ]);

    expect(data.get("series")).toBe(bookData.series);
    expect(data.get("series_position")).toBe(String(bookData.seriesPosition));
    expect(data.get("medium")).toBe("Audio");
    expect(data.get("language")).toBe("English");
    expect(data.get("publisher")).toBe(bookData.publisher);
    expect(data.get("imprint")).toBe(bookData.imprint);
    expect(data.get("issued")).toBe(bookData.issued);
    expect(data.get("rating")).toBe("4");
    expect(data.get("summary")).toContain(bookData.summary);
  });

  it("refreshes book after editing", async () => {
    const user = userEvent.setup();
    const editBook = jest.fn().mockResolvedValue(undefined);
    const refresh = jest.fn().mockResolvedValue(undefined);
    renderForm({ editBook, refresh });

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it("only adds updated summary content if it's not empty", async () => {
    const user = userEvent.setup();
    const editBook = jest.fn().mockResolvedValue(undefined);
    const refresh = jest.fn().mockResolvedValue(undefined);
    // Since we are adding an empty string, there should be no `summary` value
    // in the FormData object that gets passed to the `editBook` function.
    renderForm({
      editBook,
      refresh,
      summary: "<p></p>",
      editLink: { href: "test-url", rel: "something" },
    });

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(editBook).toHaveBeenCalledTimes(1));
    expect(editBook.mock.calls[0][1].get("summary")).toBeNull();
  });

  it("disables all inputs", () => {
    const { container } = renderForm({ disabled: true });

    container
      .querySelectorAll("input, select")
      .forEach((input) => expect(input).toBeDisabled());
  });
});
