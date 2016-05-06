jest.dontMock("../GenreForm");
jest.dontMock("./genreData");

import * as React from "react";
import { shallow } from "enzyme";

import GenreForm from "../GenreForm";
import genreData from "./genreData";

describe("GenreForm", () => {
  let wrapper;
  let genreOptions = Object.keys(genreData["Fiction"]).map(name => genreData["Fiction"][name]);
  let bookGenres = ["Adventure", "Epic Fantasy"];
  let updateGenres;
  let refresh;

  beforeEach(() => {
    updateGenres = jest.genMockFunction();
    updateGenres.mockReturnValue(new Promise((resolve, reject) => resolve()));
    refresh = jest.genMockFunction();
    wrapper = shallow(
      <GenreForm
        genres={genreOptions}
        bookGenres={bookGenres}
        updateGenres={updateGenres}
        refresh={refresh}
        />
    );
  });

  describe("rendering", () => {
    it("shows a header", () => {
      let header = wrapper.find("h3");
      expect(header.length).toBe(1)
    });

    it("shows multiple select with top-level genres", () => {
      let handleGenreSelect = (wrapper.instance() as any).handleGenreSelect;
      let topLevelGenres = genreOptions.filter(genre => genre.parents.length === 0);
      let options = wrapper.find("select[name='genres']").find("option");

      expect(options.length).toBe(topLevelGenres.length);
      options.forEach((option, i) => {
        let name = topLevelGenres[i].name;
        let hasGenre = bookGenres.indexOf(name) !== -1;
        let hasSubgenre = topLevelGenres[i].subgenres.length > 0;
        let displayName = name + (hasSubgenre ? " >" : "");
        expect(option.props().value).toBe(name);
        expect(option.props().disabled).toBe(hasGenre);
        expect(option.text()).toBe(displayName);
        expect(option.props().onClick).toBe(handleGenreSelect);
      });
    });

    it("shows multiple select with subgenres", () => {
      wrapper.setState({ genre: "Adventure" });
      let options = wrapper.find("select[name='subgenres']").find("option");

      expect(options.length).toBe(0);

      wrapper.setState({ genre: "Fantasy" });
      options = wrapper.find("select[name='subgenres']").find("option");
      let handleSubgenreSelect = (wrapper.instance() as any).handleSubgenreSelect;
      let subgenres = genreData["Fiction"]["Fantasy"].subgenres;

      expect(options.length).toBe(subgenres.length);
      options.forEach((option, i) => {
        let name = subgenres[i];
        let hasGenre = bookGenres.indexOf(name) !== -1;
        expect(option.props().value).toBe(name);
        expect(option.props().disabled).toBe(hasGenre);
        expect(option.text()).toBe(name);
        expect(option.props().onClick).toBe(handleSubgenreSelect);
      });
    });

    it("shows submit button only if genre is selected", () => {
      let button = wrapper.find("button");
      expect(button.length).toBe(0);

      wrapper.setState({ genre: "Women's Fiction" });
      button = wrapper.find("button");
      expect(button.length).toBe(1);
    });
  });

  describe("behavior", () => {
    it("shows multiple select with subgenres when genre is selected", () => {
      expect(wrapper.state("genre")).toBe(null);
      expect(wrapper.state("subgenre")).toBe(null);

      let genre = wrapper.find("select[name='genres']").find("option").first();
      genre.simulate("click", { target: { value: genre.props().value }});
      expect(wrapper.state("genre")).toBe(genre.props().value);

      let options = wrapper.find("select[name='subgenres']").find("option");
      expect(options.length).toBe(0);

      genre = wrapper
        .find("select[name='genres']")
        .find("option")
        .findWhere(option => option.props().value == "Fantasy");
      genre.simulate("click", { target: { value: genre.props().value }});
      expect(wrapper.state("genre")).toBe(genre.props().value);

      options = wrapper.find("select[name='subgenres']").find("option");
      let handleSubgenreSelect = (wrapper.instance() as any).handleSubgenreSelect;
      let subgenres = genreData["Fiction"]["Fantasy"].subgenres;

      expect(options.length).toBe(subgenres.length);
      options.forEach((option, i) => {
        let name = subgenres[i];
        let hasGenre = bookGenres.indexOf(name) !== -1;
        expect(option.props().value).toBe(name);
        expect(option.props().disabled).toBe(hasGenre);
        expect(option.text()).toBe(name);
        expect(option.props().onClick).toBe(handleSubgenreSelect);
      });

      let subgenre = options.first();
      subgenre.simulate("click", { target: { value: subgenre.props().value }});
      expect(wrapper.state("subgenre")).toBe(subgenre.props().value);
    });

    it("shows submit button only if genre is selected", () => {
      let button = wrapper.find("button");
      expect(button.length).toBe(0);

      wrapper.setState({ genre: "Women's Fiction" });
      button = wrapper.find("button");
      expect(button.length).toBe(1);
    });

    it("submits genres", () => {
      wrapper.setState({ genre: "Science Fiction", subgenre: "Space Opera" });
      let button = wrapper.find("button");
      button.simulate("click");

      expect(updateGenres.mock.calls.length).toBe(1);
      expect(updateGenres.mock.calls[0][0]).toEqual(bookGenres.concat(["Space Opera"]));
    });

    it("refreshes after submitting genres", (done) => {
      let instance = wrapper.instance() as any;
      instance.resetForm = jest.genMockFunction();
      instance.addGenre().then(() => {
        expect(refresh.mock.calls.length).toBe(1);
        expect(instance.resetForm.mock.calls.length).toBe(1);
        done();
      });
    });

    it("shows errors if submit fails", (done) => {
      updateGenres.mockReturnValue(new Promise((resolve, reject) => reject()));
      let instance = (wrapper.instance() as any);
      // using spyOn to monitor but preserve original function:
      spyOn(instance, "showGenreError").and.callThrough();
      instance.addGenre().then(() => {
        expect(instance.showGenreError).toHaveBeenCalled();
        wrapper.update();
        let error = wrapper.find(".genreFormError");
        expect(error.length).toBe(1);
        expect(error.text()).toBe("Couldn't add genre.");
        done();
      });
    });
  });
});