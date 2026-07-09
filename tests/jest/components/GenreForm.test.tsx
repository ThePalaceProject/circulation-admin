import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GenreForm from "../../../src/components/GenreForm";
import genreData from "../../../src/components/__tests__/genreData";

const genreOptions = Object.keys(genreData["Fiction"]).map(
  (name) => genreData["Fiction"][name]
);
const nonfictionOptions = Object.keys(genreData["Nonfiction"]).map(
  (name) => genreData["Nonfiction"][name]
);
const bookGenres = ["Adventure", "Epic Fantasy"];

const renderForm = (props: Record<string, unknown> = {}) => {
  const addGenre = jest.fn();
  const result = render(
    <GenreForm
      genreOptions={genreOptions}
      bookGenres={bookGenres}
      addGenre={addGenre}
      {...props}
    />
  );
  return { ...result, addGenre };
};

const genreSelect = (container: HTMLElement) =>
  container.querySelector("select[name='genre']") as HTMLSelectElement;
const genreOptionEls = (container: HTMLElement) =>
  Array.from(
    genreSelect(container).querySelectorAll<HTMLOptionElement>("option")
  );
const subgenreSelect = (container: HTMLElement) =>
  container.querySelector(
    "select[name='subgenre']"
  ) as HTMLSelectElement | null;

describe("GenreForm", () => {
  describe("rendering", () => {
    it("shows multiple select with top-level genres", () => {
      const { container } = renderForm();
      const topLevelGenres = genreOptions.filter(
        (genre) => genre.parents.length === 0
      );
      const options = genreOptionEls(container);

      expect(options).toHaveLength(topLevelGenres.length);
      options.forEach((option, i) => {
        const name = topLevelGenres[i].name;
        const hasGenre = bookGenres.indexOf(name) !== -1;
        const hasSubgenre = topLevelGenres[i].subgenres.length > 0;
        const displayName = name + (hasSubgenre ? " >" : "");
        expect(option.value).toBe(name);
        expect(option.disabled).toBe(hasGenre);
        expect(option.textContent).toBe(displayName);
      });
    });
  });

  describe("behavior", () => {
    it("shows multiple select with subgenres when genre is selected", () => {
      const { container, rerender } = renderForm();

      // Nothing is selected yet: no subgenre select and no Add button.
      expect(subgenreSelect(container)).toBeNull();
      expect(screen.queryByRole("button", { name: "Add" })).toBeNull();

      // Select a genre with no subgenres (the first option). The component wires
      // selection to `onClick` on each <option>, so fire a click there.
      const firstGenre = genreOptionEls(container)[0];
      fireEvent.click(firstGenre);
      expect(firstGenre).toHaveAttribute("aria-selected", "true");
      expect(subgenreSelect(container)).toBeNull();
      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();

      // Select a genre that has subgenres.
      const fantasy = genreOptionEls(container).find(
        (option) => option.value === "Fantasy"
      );
      fireEvent.click(fantasy);
      expect(fantasy).toHaveAttribute("aria-selected", "true");

      const subSelect = subgenreSelect(container);
      expect(subSelect).not.toBeNull();
      const subOptions = Array.from(
        subSelect.querySelectorAll<HTMLOptionElement>("option")
      );
      const subgenres = [...genreData["Fiction"]["Fantasy"].subgenres].sort();

      expect(subOptions).toHaveLength(subgenres.length);
      subOptions.forEach((option, i) => {
        const name = subgenres[i];
        const hasGenre = bookGenres.indexOf(name) !== -1;
        expect(option.value).toBe(name);
        expect(option.disabled).toBe(hasGenre);
        expect(option.textContent).toBe(name);
      });

      // Selecting a subgenre marks it as selected.
      fireEvent.click(subOptions[0]);
      expect(
        subgenreSelect(container).querySelector('option[value="Epic Fantasy"]')
      ).toHaveAttribute("aria-selected", "true");

      // Changing the genre options (fiction -> nonfiction) drops the subgenres,
      // since the selected genre no longer exists in the new options.
      rerender(
        <GenreForm
          genreOptions={nonfictionOptions}
          bookGenres={bookGenres}
          addGenre={jest.fn()}
        />
      );
      expect(subgenreSelect(container)).toBeNull();
    });

    it("shows add button only if genre is selected", () => {
      const { container } = renderForm();
      expect(screen.queryByRole("button", { name: "Add" })).toBeNull();

      const womensFiction = genreOptionEls(container).find(
        (option) => option.value === "Women's Fiction"
      );
      fireEvent.click(womensFiction);

      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    it("adds genre", async () => {
      const { container, addGenre } = renderForm();

      const scienceFiction = genreOptionEls(container).find(
        (option) => option.value === "Science Fiction"
      );
      fireEvent.click(scienceFiction);

      const spaceOpera = Array.from(
        subgenreSelect(container).querySelectorAll<HTMLOptionElement>("option")
      ).find((option) => option.value === "Space Opera");
      fireEvent.click(spaceOpera);

      await userEvent.click(screen.getByRole("button", { name: "Add" }));

      // The subgenre takes precedence over the top-level genre.
      expect(addGenre).toHaveBeenCalledTimes(1);
      expect(addGenre.mock.calls[0][0]).toBe("Space Opera");
    });
  });
});
