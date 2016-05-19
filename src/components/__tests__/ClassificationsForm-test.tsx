jest.autoMockOff();

import * as React from "react";
import { shallow, mount } from "enzyme";

import ClassificationsForm from "../ClassificationsForm";
import { EditableInput } from "../EditForm";
import GenreForm from "../GenreForm";
import genreData from "./genreData";

describe("ClassificationsForm", () => {
  let wrapper;
  let instance;
  let bookData;
  let editClassifications;

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    return inputs.filterWhere(input => input.props().name === name);
  };

  let editableInputByValue = (value) => {
    let inputs = wrapper.find(EditableInput);
    return inputs.filterWhere(input => input.props().value === value);
  };

  describe("rendering", () => {
    beforeEach(() => {
      bookData = {
        title: "title",
        audience: "Young Adult",
        targetAgeRange: ["12", "16"],
        fiction: true,
        categories: ["Space Opera"]
      };
      editClassifications = jest.genMockFunction();
      wrapper = shallow(
        <ClassificationsForm
          book={bookData}
          genreTree={genreData}
          csrfToken="token"
          editClassifications={editClassifications}
          />
      );
      instance = wrapper.instance();
    });

    it("shows editable select with audience", () => {
      let input = editableInputByName("audience");
      expect(input.props().type).toBe("select")
      expect(input.props().label).toBe("Audience");
      expect(input.props().value).toBe("Young Adult");
    });

    it("shows editable inputs with min and max target age", () => {
      let input = editableInputByName("target_age_min");
      expect(input.props().label).toBe("");
      expect(input.props().value).toBe("12");

      input = editableInputByName("target_age_max");
      expect(input.props().label).toBe("");
      expect(input.props().value).toBe("16");
    });

    it("shows editable radio buttons with fiction status", () => {
      let fictionInput = editableInputByValue("fiction");
      let nonfictionInput = editableInputByValue("nonfiction");

      expect(fictionInput.props().type).toBe("radio");
      expect(fictionInput.props().label).toBe(" Fiction");
      expect(fictionInput.props().checked).toBe(true);
      expect(fictionInput.props().value).toBe("fiction");

      expect(nonfictionInput.props().type).toBe("radio");
      expect(nonfictionInput.props().label).toBe(" Nonfiction");
      expect(nonfictionInput.props().checked).toBe(false);
      expect(nonfictionInput.props().value).toBe("nonfiction");
    });

    it("shows the book's full genres and remove buttons", () => {
      let genres = wrapper.find(".bookGenre");
      expect(genres.length).toBe(bookData.categories.length);

      genres.forEach((genre, i) => {
        let cells = genre.find(".bookGenreName");
        expect(cells.first().text()).toBe(instance.fullGenre(bookData.categories[i]));

        let button = genre.find(".removeBookGenre");
        expect(button.length).toBe(1);

        // plus accessible remove buttons
        let link = genre.find("a.sr-only");
        expect(link.length).toBe(1);
      });
    });

    it("shows the book's full genres and remove buttons even if inconsistent with fiction status", () => {
      let inconsistentBookData = Object.assign({}, bookData, { fiction: false });
      wrapper.setProps({ book: inconsistentBookData });

      let genres = wrapper.find(".bookGenre");
      expect(genres.length).toBe(bookData.categories.length);

      genres.forEach((genre, i) => {
        let cells = genre.find(".bookGenreName");
        expect(cells.first().text()).toBe(instance.fullGenre(bookData.categories[i]));

        let button = genre.find(".removeBookGenre");
        expect(button.length).toBe(1);

        // plus accessible remove buttons
        let link = genre.find("a.sr-only");
        expect(link.length).toBe(1);
      });
    });

    it("shows genre form", () => {
      let form = wrapper.find(GenreForm);
      expect(form.length).toBe(1);
      expect(form.props().disabled).toBeFalsy();
      expect(form.props().genreOptions).toEqual(instance.genreOptions());
      expect(form.props().bookGenres).toEqual(instance.bookGenres(bookData));
    });

    it("shows submit button", () => {
      let button = wrapper.find("button").filterWhere(button => button.text() === "Save");
      expect(button.length).toBe(1);
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      bookData = {
        title: "title",
        audience: "Young Adult",
        targetAgeRange: ["12", "16"],
        fiction: true,
        categories: ["Space Opera"]
      };
      editClassifications = jest.genMockFunction();
      wrapper = mount(
        <ClassificationsForm
          book={bookData}
          genreTree={genreData}
          csrfToken="token"
          editClassifications={editClassifications}
          />
      );
      instance = wrapper.instance();
    });

    it("shows and hides target age inputs when audience changes", () => {
      let minAgeInput = editableInputByName("target_age_min");
      let maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).toBe(1);
      expect(maxAgeInput.length).toBe(1);

      let select = wrapper.find("select[name='audience']") as any;
      let selectElement = select.get(0);
      selectElement.value = "Adult";
      select.simulate("change");
      minAgeInput = editableInputByName("target_age_min");
      maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).toBe(0);
      expect(maxAgeInput.length).toBe(0);

      selectElement.value = "Children";
      select.simulate("change");
      minAgeInput = editableInputByName("target_age_min");
      maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).toBe(1);
      expect(maxAgeInput.length).toBe(1);
    });

    it("changes both fiction status radio buttons", () => {
      spyOn(window, "confirm").and.returnValue(true);

      let fictionInput = wrapper.find("input[value='fiction']");
      let nonfictionInput = wrapper.find("input[value='nonfiction']");
      expect(fictionInput.length).toEqual(1);
      expect(nonfictionInput.length).toEqual(1);

      let fictionElement = fictionInput.get(0);
      let nonfictionElement = nonfictionInput.get(0);

      expect((fictionElement as any).checked).toBe(true);
      expect((nonfictionElement as any).checked).toBe(false);

      (nonfictionElement as any).checked = true;
      nonfictionInput.simulate("change");

      // change to nonfiction should prompt user and clear fiction genre
      expect(window.confirm).toHaveBeenCalled();
      expect(wrapper.state("genres")).toEqual([])

      expect((fictionElement as any).checked).toBe(false);
      expect((nonfictionElement as any).checked).toBe(true);

      (fictionElement as any).checked = true;
      fictionInput.simulate("change");

      expect((fictionElement as any).checked).toBe(true);
      expect((nonfictionElement as any).checked).toBe(false);
    });

    it("adds genre to list of selected genres after validating against audience", () => {
      // can't add Erotica to book with Young Adult audience
      instance.addGenre("Erotica");
      let newGenres = wrapper.find(".bookGenreName").map(name => name.text());
      expect(newGenres.sort()).toEqual(bookData.categories.map(genre => instance.fullGenre(genre)).sort());

      instance.validateAudience = jest.genMockFunction();
      instance.validateAudience.mockReturnValue(true);
      instance.addGenre("Folklore");

      expect(instance.validateAudience.mock.calls.length).toBe(1);
      newGenres = wrapper.find(".bookGenreName").map(name => name.text());
      expect(newGenres).toContain(instance.fullGenre("Folklore"));
    });

    it("removes genre when remove button is clicked", () => {
      let button = wrapper.find(".fa-times");
      button.simulate("click");

      let newGenres = wrapper.find(".bookGenreName");
      expect(newGenres.length).toEqual(0);
    });

    it("calls removes genre when accessible remove button is clicked", () => {
      let button = wrapper.find("a.sr-only");
      button.simulate("click");

      let newGenres = wrapper.find(".bookGenreName");
      expect(newGenres.length).toEqual(0);
    });

    it("submits data when submit button is clicked", () => {
      let button = wrapper.find("button").findWhere(button => button.text() === "Save");
      button.simulate("click");

      let formData = new FormData();
      formData.append("csrf_token", "token");
      formData.append("audience", "Young Adult");
      formData.append("target_age_min", "12");
      formData.append("target_age_max", "16");
      formData.append("fiction", "fiction");
      formData.append("genres", "Space Opera");

      expect(editClassifications.mock.calls.length).toBe(1);
      expect(editClassifications.mock.calls[0][0]).toEqual(formData);
    });

    it("updates state upon receiving new props", () => {
      let newBookData = Object.assign({}, bookData, {
        audience: "Adult",
        fiction: false,
        categories: ["Urban Fantasy"]
      });
      wrapper.setProps({ book: newBookData });

      expect(wrapper.state("audience")).toBe("Adult");
      expect(wrapper.state("fiction")).toBe(false);
      expect(wrapper.state("genres")).toEqual(["Urban Fantasy"]);
    });
  });
})