jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import ClassificationsForm from "../ClassificationsForm";
import ButtonForm from "../ButtonForm";
import GenreForm from "../GenreForm";
import genreData from "./genreData";

describe("ClassificationsForm", () => {
  let wrapper;
  let instance;
  let bookData;
  let editClassifications;

  beforeEach(() => {
    bookData = {
      title: "title",
      fiction: true,
      categories: ["Space Opera"]
    };
    editClassifications = jest.genMockFunction();
    wrapper = shallow(
      <ClassificationsForm
        book={bookData}
        genres={genreData}
        csrfToken="token"
        editClassifications={editClassifications}
        />
    );
    instance = wrapper.instance();
  });

  describe("rendering", () => {
    it("shows the book's full genres and remove buttons", () => {
      let genres = wrapper.find(".bookGenre");
      expect(genres.length).toBe(bookData.categories.length);

      genres.forEach((row, i) => {
        let cells = genres.find(".bookGenreName");
        expect(cells.first().text()).toBe(instance.fullGenre(bookData.categories[i]));

        let button = genres.find(".removeBookGenre");
        expect(button.length).toBe(1);
      });
    });

    it("shows genre form", () => {
      let form = wrapper.find(GenreForm);
      expect(form.length).toBe(1);
    });
  });

  describe("behavior", () => {
    it("calls remove() when remove button is clicked", () => {
      instance.removeGenre = jest.genMockFunction();
      let button = wrapper.find(".fa-times");
      button.simulate("click");

      expect(instance.removeGenre.mock.calls.length).toBe(1);
      expect(instance.removeGenre.mock.calls[0][0]).toBe("Space Opera");
    });
  });
})