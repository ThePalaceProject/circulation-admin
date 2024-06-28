import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ClassificationsForm from "../ClassificationsForm";
import EditableInput from "../EditableInput";
import WithRemoveButton from "../WithRemoveButton";
import GenreForm from "../GenreForm";
import genreData from "./genreData";

describe("ClassificationsForm", () => {
  let wrapper;
  let instance;
  let bookData;
  let editClassifications;

  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    return inputs.filterWhere((input) => input.props().name === name);
  };

  const editableInputByValue = (value) => {
    const inputs = wrapper.find(EditableInput);
    return inputs.filterWhere((input) => input.props().value === value);
  };

  describe("rendering without classification values", () => {
    let confirmStub;
    beforeEach(() => {
      bookData = {
        title: "title",
        audience: undefined,
        targetAgeRange: ["12", "16"],
        fiction: undefined,
        categories: ["Space Opera"],
      };
      editClassifications = stub();
      confirmStub = stub(window, "confirm").returns(true);
      wrapper = mount(
        <ClassificationsForm
          book={bookData}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      instance = wrapper.instance();
    });

    afterEach(() => {
      confirmStub.restore();
    });

    it("should have no values displayed for the audience or fiction classifications", () => {
      const select = editableInputByName("audience");
      expect(select.props().label).to.equal("Audience");
      expect(select.props().value).to.equal("None");

      const options = select.find("select").children();
      expect(options.length).to.equal(7);

      // This only gets rendered without an initial fiction classification:
      const noFictionSelectedRadio = wrapper
        .find(EditableInput)
        .filterWhere((input) => input.props().value === "none");
      const fictionRadio = wrapper
        .find(EditableInput)
        .filterWhere((input) => input.props().value === "fiction");
      const nonfictionRadio = wrapper
        .find(EditableInput)
        .filterWhere((input) => input.props().value === "nonfiction");

      expect(noFictionSelectedRadio.props().type).to.equal("radio");
      expect(noFictionSelectedRadio.props().label).to.equal("None");
      expect(noFictionSelectedRadio.props().checked).to.equal(true);
      expect(noFictionSelectedRadio.props().name).to.equal("fiction");

      expect(fictionRadio.props().type).to.equal("radio");
      expect(fictionRadio.props().label).to.equal("Fiction");
      expect(fictionRadio.props().checked).to.equal(false);
      expect(fictionRadio.props().name).to.equal("fiction");

      expect(nonfictionRadio.props().type).to.equal("radio");
      expect(nonfictionRadio.props().label).to.equal("Nonfiction");
      expect(nonfictionRadio.props().checked).to.equal(false);
      expect(nonfictionRadio.props().name).to.equal("fiction");
    });

    it("should not allow you to submit if you didn't select an audience or a fiction classification", () => {
      const button = wrapper
        .find("button")
        .findWhere((button) => button.text() === "Save")
        .at(0);
      button.simulate("click");

      expect(wrapper.state().audience).to.equal("None");
      expect(wrapper.state().fiction).to.equal(undefined);
      expect(editClassifications.callCount).to.equal(0);
    });

    it("should render error messages without an audience or a fiction classification", () => {
      const button = wrapper
        .find("button")
        .findWhere((button) => button.text() === "Save")
        .at(0);

      button.simulate("click");
      const alert = wrapper.find(".alert-danger");

      expect(editClassifications.callCount).to.equal(0);
      expect(alert.length).to.equal(1);
      expect(alert.text()).to.equal(
        "No Audience classification selected.No Fiction classification selected."
      );
    });

    it("should not allow you to submit if you didn't select an audience", () => {
      const button = wrapper
        .find("button")
        .findWhere((button) => button.text() === "Save")
        .at(0);
      let alert;
      wrapper.setState({ fiction: true });

      button.simulate("click");
      alert = wrapper.find(".alert-danger");
      expect(editClassifications.callCount).to.equal(0);
      expect(alert.length).to.equal(1);

      const select = wrapper.find("select[name='audience']") as any;
      const selectElement = select.getDOMNode();
      selectElement.value = "Adult";
      select.simulate("change");
      button.simulate("click");

      alert = wrapper.find(".alert-danger");
      expect(editClassifications.callCount).to.equal(1);
      // The alert message should go away.
      expect(alert.length).to.equal(0);
    });

    it("should not allow you to submit if you didn't select a fiction classification", () => {
      const button = wrapper
        .find("button")
        .findWhere((button) => button.text() === "Save")
        .at(0);
      wrapper.setState({ audience: "Adult" });

      button.simulate("click");
      expect(editClassifications.callCount).to.equal(0);

      const nonfictionInput = wrapper.find("input[value='nonfiction']");
      const nonfictionElement = nonfictionInput.getDOMNode();
      expect((nonfictionElement as any).checked).to.equal(false);

      (nonfictionElement as any).checked = true;
      nonfictionInput.simulate("change");
      button.simulate("click");

      expect(editClassifications.callCount).to.equal(1);
    });
  });

  describe("rendering", () => {
    beforeEach(() => {
      bookData = {
        title: "title",
        audience: "Young Adult",
        targetAgeRange: ["12", "16"],
        fiction: true,
        categories: ["Space Opera"],
      };
      editClassifications = stub();
      wrapper = mount(
        <ClassificationsForm
          book={bookData}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      instance = wrapper.instance();
    });

    it("shows editable select with audience options", () => {
      const select = editableInputByName("audience");
      expect(select.props().label).to.equal("Audience");
      expect(select.props().value).to.equal("Young Adult");

      const options = select.find("select").children();
      // The "None" select Audience value should not be rendered.
      expect(options.length).to.equal(6);
    });

    it("shows editable inputs with min and max target age", () => {
      let input = editableInputByName("target_age_min");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("12");

      input = editableInputByName("target_age_max");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("16");
    });

    it("shows editable radio buttons with fiction status", () => {
      const fictionRadio = wrapper
        .find(EditableInput)
        .filterWhere((input) => input.props().value === "fiction");
      const nonfictionRadio = wrapper
        .find(EditableInput)
        .filterWhere((input) => input.props().value === "nonfiction");

      expect(fictionRadio.props().type).to.equal("radio");
      expect(fictionRadio.props().label).to.equal("Fiction");
      expect(fictionRadio.props().checked).to.equal(true);
      expect(fictionRadio.props().name).to.equal("fiction");

      expect(nonfictionRadio.props().type).to.equal("radio");
      expect(nonfictionRadio.props().label).to.equal("Nonfiction");
      expect(nonfictionRadio.props().checked).to.equal(false);
      expect(nonfictionRadio.props().name).to.equal("fiction");
    });

    it("shows the book's full genres with remove buttons", () => {
      const genres = wrapper.find(WithRemoveButton);
      expect(genres.length).to.equal(1);
      expect(genres.props().children).to.contain(
        "Science Fiction > Space Opera"
      );
    });

    it("shows the book's full genres with remove buttons even if inconsistent with fiction status", () => {
      const inconsistentBookData = Object.assign({}, bookData, {
        fiction: false,
      });
      wrapper.setProps({ book: inconsistentBookData });

      const genres = wrapper.find(WithRemoveButton);
      expect(genres.length).to.equal(1);
      expect(genres.props().children).to.contain(
        "Science Fiction > Space Opera"
      );
    });

    it("shows genre form", () => {
      const form = wrapper.find(GenreForm);
      expect(form.length).to.equal(1);
      expect(form.props().disabled).not.to.be.ok;
      expect(form.props().genreOptions).to.deep.equal(instance.genreOptions());
      expect(form.props().bookGenres).to.deep.equal(
        instance.bookGenres(bookData)
      );
    });

    it("shows submit button", () => {
      const button = wrapper
        .find("button")
        .filterWhere((button) => button.text() === "Save");
      expect(button.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    let confirmStub;

    beforeEach(() => {
      confirmStub = stub(window, "confirm").returns(true);
      bookData = {
        title: "title",
        audience: "Young Adult",
        targetAgeRange: ["12", "16"],
        fiction: true,
        categories: ["Space Opera"],
      };
      editClassifications = stub();
      wrapper = mount(
        <ClassificationsForm
          book={bookData}
          genreTree={genreData}
          editClassifications={editClassifications}
        />
      );
      instance = wrapper.instance();
    });

    afterEach(() => {
      confirmStub.restore();
    });

    it("shows and hides target age inputs when audience changes", () => {
      let minAgeInput = editableInputByName("target_age_min");
      let maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).to.equal(1);
      expect(maxAgeInput.length).to.equal(1);

      const select = wrapper.find("select[name='audience']") as any;
      const selectElement = select.getDOMNode();
      selectElement.value = "Adult";
      select.simulate("change");
      minAgeInput = editableInputByName("target_age_min");
      maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).to.equal(0);
      expect(maxAgeInput.length).to.equal(0);

      selectElement.value = "Children";
      select.simulate("change");
      minAgeInput = editableInputByName("target_age_min");
      maxAgeInput = editableInputByName("target_age_max");
      expect(minAgeInput.length).to.equal(1);
      expect(maxAgeInput.length).to.equal(1);
    });

    it("changes both fiction status radio buttons", () => {
      const fictionInput = wrapper.find("input[value='fiction']");
      const nonfictionInput = wrapper.find("input[value='nonfiction']");
      expect(fictionInput.length).to.equal(1);
      expect(nonfictionInput.length).to.equal(1);

      const fictionElement = fictionInput.getDOMNode();
      const nonfictionElement = nonfictionInput.getDOMNode();
      expect((fictionElement as any).checked).to.equal(true);
      expect((nonfictionElement as any).checked).to.equal(false);

      (nonfictionElement as any).checked = true;
      nonfictionInput.simulate("change");

      // change to nonfiction should prompt user and clear fiction genre
      expect(confirmStub.callCount).to.be.above(0);
      expect(wrapper.state("genres")).to.deep.equal([]);

      expect((fictionElement as any).checked).to.equal(false);
      expect((nonfictionElement as any).checked).to.equal(true);

      (fictionElement as any).checked = true;
      fictionInput.simulate("change");

      expect((fictionElement as any).checked).to.equal(true);
      expect((nonfictionElement as any).checked).to.equal(false);
    });

    it("adds genre to list of selected genres after validating against audience", () => {
      // can't add Erotica to book with Young Adult audience
      instance.addGenre("Erotica");
      let newGenres = wrapper.find(WithRemoveButton).map((name) => name.text());
      expect(newGenres.length).to.equal(1);
      expect(newGenres[0]).to.contain(
        instance.fullGenre(bookData.categories[0]) + "Delete"
      );
      expect(newGenres[0]).not.to.contain("Erotica");

      instance.validateAudience = stub().returns(true);
      expect(instance.validateAudience.callCount).to.equal(0);
      instance.addGenre("Folklore");
      wrapper.update();

      expect(instance.validateAudience.callCount).to.equal(1);
      newGenres = wrapper.find(WithRemoveButton).map((name) => name.text());
      expect(newGenres[0]).to.contain(
        instance.fullGenre("Folklore") + "Delete"
      );
    });

    it("removes genre when remove button is clicked", () => {
      const button = wrapper.find(WithRemoveButton);
      const onRemove = button.props().onRemove;
      onRemove();
      wrapper.update();

      const newGenres = wrapper.find(WithRemoveButton);
      expect(newGenres.length).to.equal(0);
    });

    it("submits data when submit button is clicked", () => {
      const button = wrapper
        .find("button")
        .findWhere((button) => button.text() === "Save")
        .at(0);
      button.simulate("click");

      const formData = new (window as any).FormData();
      formData.append("csrf_token", "token");
      formData.append("audience", "Young Adult");
      formData.append("target_age_min", "12");
      formData.append("target_age_max", "16");
      formData.append("fiction", "fiction");
      formData.append("genres", "Space Opera");

      expect(editClassifications.callCount).to.equal(1);
      expect(editClassifications.args[0][0]).to.deep.equal(formData);
    });

    it("updates state upon receiving new state-related props", () => {
      const newBookData = Object.assign({}, bookData, {
        audience: "Adult",
        fiction: false,
        categories: ["Cooking"],
      });
      wrapper.setProps({ book: newBookData });

      expect(wrapper.state("audience")).to.equal("Adult");
      expect(wrapper.state("fiction")).to.equal(false);
      expect(wrapper.state("genres")).to.deep.equal(["Cooking"]);
    });

    it("doesn't update state upon receiving new state-unrelated props", () => {
      // state updated with new form inputs
      wrapper.setState({ fiction: false, genres: ["Cooking"] });
      // form submitted, disabling form
      wrapper.setProps({ disabled: true });
      // state should not change back to earlier book props
      expect(wrapper.state("fiction")).to.equal(false);
      expect(wrapper.state("genres")).to.deep.equal(["Cooking"]);
    });
  });
});
