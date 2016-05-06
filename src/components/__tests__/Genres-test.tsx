jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import { Genres } from "../Genres";
import ErrorMessage from "../ErrorMessage";
import ButtonForm from "../ButtonForm";
import GenreForm from "../GenreForm";
import buildStore from "../../store";
import genreData from "./genreData";

describe("Genres", () => {
  let wrapper;
  let instance;
  let bookData;
  let store;
  let refreshBrowser, fetchGenres, fetchClassifications, fetchBook, updateGenres;

  beforeEach(() => {
    bookData = {
      title: "title",
      fiction: true,
      categories: ["Space Opera"]
    };
    store = buildStore();
    refreshBrowser = jest.genMockFunction();
    fetchGenres = jest.genMockFunction();
    fetchClassifications = jest.genMockFunction();
    fetchBook = jest.genMockFunction();
    updateGenres = jest.genMockFunction();
    wrapper = shallow(
      <Genres
        store={store}
        csrfToken="token"
        bookUrl="book url"
        book={bookData}
        genres={genreData}
        refreshBrowser={refreshBrowser}
        fetchGenres={fetchGenres}
        fetchClassifications={fetchClassifications}
        fetchBook={fetchBook}
        updateGenres={updateGenres}
        />
    );
    instance = wrapper.instance() as any;
  });

  describe("rendering", () => {
    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).toBe(bookData.title);
    });

    it("hides/shows updating indicator", () => {
      let updating = wrapper.find("h4");
      expect(updating.length).toBe(0);

      wrapper.setProps({ isFetching: true })
      updating = wrapper.find("h4");
      expect(updating.text()).toBe("Updating");
    });

    it("shows fetchError", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).toBe(0);

      let errorData = { status: 500, url: "url", response: "error" };
      wrapper.setProps({ fetchError: errorData });
      error = wrapper.find(ErrorMessage);
      expect(error.props().error).toBe(errorData);
    });

    it("shows the book's full genres and remove buttons", () => {
      let rows = wrapper.find("tr.bookGenre");
      expect(rows.length).toBe(bookData.categories.length);

      rows.forEach((row, i) => {
        let cells = rows.find("td");
        expect(cells.first().text()).toBe(instance.fullGenre(bookData.categories[i]));

        let button = rows.find(ButtonForm);
        expect(button.length).toBe(1);
        expect(button.props().label).toBe("Remove");
      });
    });

    it("shows genre form", () => {
      let form = wrapper.find(GenreForm);
      expect(form.length).toBe(1);
    });
  });

  describe("behavior", () => {
    it("fetches genres on mount", () => {
      expect(fetchGenres.mock.calls.length).toBe(1);
      expect(fetchGenres.mock.calls[0][0]).toBe("/admin/genres");
      expect(fetchClassifications.mock.calls.length).toBe(1);
      expect(fetchClassifications.mock.calls[0][0]).toBe(instance.classificationsUrl());
    });

    it("calls remove() when remove button is clicked", () => {
      instance.remove = jest.genMockFunction();
      let button = wrapper.find(ButtonForm);
      button.simulate("click");

      expect(instance.remove.mock.calls.length).toBe(1);
      expect(instance.remove.mock.calls[0][0]).toBe("Space Opera");
    });

    it("removes genre and refreshes", (done) => {
      spyOn(window, "confirm").and.returnValue(true);
      spyOn(instance, "updateGenres").and.callThrough(); // monitor without mocking
      updateGenres.mockReturnValue(new Promise((resolve, reject) => resolve()));
      instance.remove("Space Opera").then(() => {
        expect(instance.updateGenres).toHaveBeenCalledWith([]);
        expect(updateGenres.mock.calls.length).toBe(1);
        expect(updateGenres.mock.calls[0][0]).toBe(instance.updateGenresUrl());
        expect(fetchBook.mock.calls.length).toBe(1);
        expect(fetchClassifications.mock.calls.length).toBe(2); // also called on mount
        expect(refreshBrowser.mock.calls.length).toBe(1);
        done();
      });
    });
  });
});