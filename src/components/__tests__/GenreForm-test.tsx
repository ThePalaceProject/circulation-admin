import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";

import GenreForm from "../GenreForm";
import genreData from "./genreData";

describe("GenreForm", () => {
  let wrapper;
  const genreOptions = Object.keys(genreData["Fiction"]).map(
    (name) => genreData["Fiction"][name]
  );
  const bookGenres = ["Adventure", "Epic Fantasy"];
  let addGenre;
  let refresh;

  beforeEach(() => {
    addGenre = stub().returns(
      new Promise<void>((resolve, reject) => resolve())
    );
    wrapper = shallow(
      <GenreForm
        genreOptions={genreOptions}
        bookGenres={bookGenres}
        addGenre={addGenre}
      />
    );
  });

  describe("rendering", () => {
    it("shows multiple select with top-level genres", () => {
      const handleGenreSelect = (wrapper.instance() as any).handleGenreSelect;
      const topLevelGenres = genreOptions.filter(
        (genre) => genre.parents.length === 0
      );
      const options = wrapper.find("select[name='genre']").find("option");

      expect(options.length).to.equal(topLevelGenres.length);
      options.forEach((option, i) => {
        const name = topLevelGenres[i].name;
        const hasGenre = bookGenres.indexOf(name) !== -1;
        const hasSubgenre = topLevelGenres[i].subgenres.length > 0;
        const displayName = name + (hasSubgenre ? " >" : "");
        expect(option.props().value).to.equal(name);
        expect(option.props().disabled).to.equal(hasGenre);
        expect(option.text()).to.equal(displayName);
        expect(option.props().onClick).to.equal(handleGenreSelect);
      });
    });
  });

  describe("behavior", () => {
    it("shows multiple select with subgenres when genre is selected", () => {
      expect(wrapper.state("genre")).to.equal(null);
      expect(wrapper.state("subgenre")).to.equal(null);

      // click on genre without subgenres
      let genre = wrapper.find("select[name='genre']").find("option").first();
      genre.simulate("click", { target: { value: genre.props().value } });
      expect(wrapper.state("genre")).to.equal(genre.props().value);

      let options = wrapper.find("select[name='subgenre']").find("option");
      expect(options.length).to.equal(0);

      // click on genre with subgenres
      genre = wrapper
        .find("select[name='genre']")
        .find("option")
        .findWhere((option) => option.props().value === "Fantasy");
      genre.simulate("click", { target: { value: genre.props().value } });
      expect(wrapper.state("genre")).to.equal(genre.props().value);

      options = wrapper.find("select[name='subgenre']").find("option");
      const handleSubgenreSelect = (wrapper.instance() as any)
        .handleSubgenreSelect;
      const subgenres = genreData["Fiction"]["Fantasy"].subgenres;

      expect(options.length).to.equal(subgenres.length);
      options.forEach((option, i) => {
        const name = subgenres[i];
        const hasGenre = bookGenres.indexOf(name) !== -1;
        expect(option.props().value).to.equal(name);
        expect(option.props().disabled).to.equal(hasGenre);
        expect(option.text()).to.equal(name);
        expect(option.props().onClick).to.equal(handleSubgenreSelect);
      });

      // click on subgenre
      const subgenre = options.first();
      subgenre.simulate("click", { target: { value: subgenre.props().value } });
      expect(wrapper.state("subgenre")).to.equal(subgenre.props().value);

      // genreOptions changes due to change in fiction status
      const newGenreOptions = Object.keys(genreData["Nonfiction"]).map(
        (name) => genreData["Nonfiction"][name]
      );
      wrapper.setProps({ genreOptions: newGenreOptions });
      options = wrapper.find("select[name='subgenre']").find("option");
      expect(options.length).to.equal(0);
    });

    it("shows add button only if genre is selected", () => {
      let button = wrapper.find(Button);
      expect(button.length).to.equal(0);

      wrapper.setState({ genre: "Women's Fiction" });
      button = wrapper.find(Button);
      expect(button.length).to.equal(1);
    });

    it("adds genre", () => {
      wrapper = mount(
        <GenreForm
          genreOptions={genreOptions}
          bookGenres={bookGenres}
          addGenre={addGenre}
        />
      );
      wrapper.setState({ genre: "Science Fiction", subgenre: "Space Opera" });
      wrapper.find(Button).simulate("click");

      expect(addGenre.callCount).to.equal(1);
      expect(addGenre.args[0][0]).to.equal("Space Opera");
    });
  });
});
