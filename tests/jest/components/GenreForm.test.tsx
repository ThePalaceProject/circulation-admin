import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GenreForm from "../../../src/components/book/GenreForm";
import genreData from "../../../src/components/__tests__/genreData";

const genreOptions = Object.keys(genreData["Fiction"]).map(
  (name) => genreData["Fiction"][name]
);
const bookGenres = ["Adventure", "Epic Fantasy"];

describe("GenreForm", () => {
  describe("rendering", () => {
    it("shows select with top-level genres", () => {
      const { container } = render(
        <GenreForm
          genreOptions={genreOptions}
          bookGenres={bookGenres}
          addGenre={jest.fn()}
        />
      );
      const select = container.querySelector("select[name='genre']");
      expect(select).toBeInTheDocument();
      const topLevelGenres = genreOptions.filter(
        (genre) => genre.parents.length === 0
      );
      const options = select.querySelectorAll("option");
      expect(options.length).toBe(topLevelGenres.length);
    });

    it("disables options for genres already in the book", () => {
      const { container } = render(
        <GenreForm
          genreOptions={genreOptions}
          bookGenres={bookGenres}
          addGenre={jest.fn()}
        />
      );
      const options = container.querySelectorAll(
        "select[name='genre'] option"
      ) as NodeListOf<HTMLOptionElement>;
      const adventureOption = Array.from(options).find(
        (o) => o.value === "Adventure"
      );
      expect(adventureOption.disabled).toBe(true);
    });
  });

  describe("behavior", () => {
    it("shows Add button only after a genre is selected", () => {
      const { container } = render(
        <GenreForm
          genreOptions={genreOptions}
          bookGenres={bookGenres}
          addGenre={jest.fn()}
        />
      );
      // No button before selection
      expect(
        screen.queryByRole("button", { name: /add/i })
      ).not.toBeInTheDocument();

      // Click on a non-disabled option
      const options = container.querySelectorAll(
        "select[name='genre'] option"
      ) as NodeListOf<HTMLOptionElement>;
      const classicsOption = Array.from(options).find(
        (o) => o.value === "Classics"
      );
      fireEvent.click(classicsOption, { target: { value: "Classics" } });
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("calls addGenre on button click", () => {
      const addGenre = jest.fn().mockResolvedValue(undefined);
      const { container } = render(
        <GenreForm
          genreOptions={genreOptions}
          bookGenres={bookGenres}
          addGenre={addGenre}
        />
      );
      const options = container.querySelectorAll(
        "select[name='genre'] option"
      ) as NodeListOf<HTMLOptionElement>;
      const classicsOption = Array.from(options).find(
        (o) => o.value === "Classics"
      );
      fireEvent.click(classicsOption, { target: { value: "Classics" } });
      fireEvent.click(screen.getByRole("button", { name: /add/i }));
      expect(addGenre).toHaveBeenCalledWith("Classics");
    });
  });
});
