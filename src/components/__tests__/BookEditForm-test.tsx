import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import BookEditForm from "../BookEditForm";
import EditableInput from "../EditableInput";
import WithRemoveButton from "../WithRemoveButton";
import LanguageField from "../LanguageField";
import { BookData, RolesData, MediaData, LanguagesData } from "../../interfaces";

describe("BookEditForm", () => {
  let roles: RolesData = {
    "aut": "Author",
    "nar": "Narrator"
  };

  let media: MediaData = {
    "http://schema.org/AudioObject": "Audio",
    "http://schema.org/Book": "Book"
  };

  let languages: LanguagesData = {
    "eng": ["English"],
    "spa": ["Spanish", "Castilian"]
  };

  let bookData: BookData = {
    id: "id",
    title: "title",
    subtitle: "subtitle",
    authors: [{ name: "An Author", role: "aut" }],
    contributors: [{ name: "A Narrator", role: "nar" }, { name: "Another Narrator", role: "nar" }],
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
      rel: "edit"
    }
  };

  let wrapper;
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
      wrapper = mount(
        <BookEditForm
          {...bookData}
          roles={roles}
          media={media}
          languages={languages}
          disabled={false}
          refresh={stub()}
          editBook={stub()}
        />
      );
    });

    it("shows editable input with title", () => {
      let input = editableInputByName("title");
      expect(input.props().label).to.equal("Title");
      expect(input.props().value).to.equal("title");
    });

    it("shows editable input with subtitle", () => {
      let input = editableInputByName("subtitle");
      expect(input.props().label).to.equal("Subtitle");
      expect(input.props().value).to.equal("subtitle");
    });

    it("shows authors and contributors", () => {
      let contributorNames = editableInputByName("contributor-name");
      let contributorRoles = editableInputByName("contributor-role");
      expect(contributorNames.length).to.equal(4);
      expect(contributorRoles.length).to.equal(4);
      expect(contributorNames.at(0).props().value).to.equal("An Author");
      expect(contributorRoles.at(0).props().value).to.equal("Author");
      expect(contributorNames.at(1).props().value).to.equal("A Narrator");
      expect(contributorRoles.at(1).props().value).to.equal("Narrator");
      expect(contributorNames.at(2).props().value).to.equal("Another Narrator");
      expect(contributorRoles.at(2).props().value).to.equal("Narrator");

      // The last inputs are for adding a new contributor.
      expect(contributorNames.at(3).props().value).to.be.undefined;
      expect(contributorRoles.at(3).props().value).to.equal("Author");
      let addButton = wrapper.find("button.add-contributor");
      expect(addButton.length).to.equal(1);

      // Existing authors and contributors are removable.
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(3);

      // All roles inputs have the same options.
      let roles = contributorRoles.at(1).find("option");
      expect(roles.length).to.equal(2);
      expect(roles.at(0).props().value).to.equal("Author");
      expect(roles.at(1).props().value).to.equal("Narrator");
      roles = contributorRoles.at(3).find("option");
      expect(roles.length).to.equal(2);
      expect(roles.at(0).props().value).to.equal("Author");
      expect(roles.at(1).props().value).to.equal("Narrator");
    });

    it("shows editable input with series", () => {
      let input = editableInputByName("series");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("series");
    });

    it("shows editable input with series position", () => {
      let input = editableInputByName("series_position");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("3");
    });

    it("shows editable input with medium", () => {
      let input = editableInputByName("medium");
      expect(input.props().label).to.equal("Medium");
      expect(input.props().value).to.equal("Audio");
    });

    it("shows a language field", () => {
      let languageField = wrapper.find(LanguageField);
      expect(languageField.prop("name")).to.equal("language");
      expect(languageField.prop("label")).to.equal("Language");
      expect(languageField.prop("value")).to.equal("eng");
      expect(languageField.prop("languages")).to.equal(wrapper.prop("languages"));

      wrapper.setProps({ language: "fre" });
      languageField = wrapper.find(LanguageField);
      expect(languageField.prop("value")).to.equal("fre");
    });

    it("shows editable input with publisher", () => {
      let input = editableInputByName("publisher");
      expect(input.props().label).to.equal("Publisher");
      expect(input.props().value).to.equal("publisher");
    });

    it("shows editable input with imprint", () => {
      let input = editableInputByName("imprint");
      expect(input.props().label).to.equal("Imprint");
      expect(input.props().value).to.equal("imprint");
    });

    it("shows editable input with publication date", () => {
      let input = editableInputByName("issued");
      expect(input.props().label).to.equal("Publication Date");
      expect(input.props().value).to.equal("2017-04-03");
    });

    it("shows editable input with rating", () => {
      let input = editableInputByName("rating");
      expect(input.props().label).to.contain("Rating");
      expect(input.props().value).to.equal("4");
    });

    it("shows editable textarea with summary", () => {
      let textarea = editableInputByName("summary");
      expect(textarea.prop("label")).to.equal("Summary");
      expect(textarea.prop("value")).to.equal("summary");
    });
  });

  it("removes a contributor", async () => {
    let editBook = stub();
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);
    let firstNarrator = removables.at(1);
    let onRemove = firstNarrator.prop("onRemove");

    onRemove();
    wrapper.update();

    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    let contributorNames = editableInputByName("contributor-name");
    let contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(3);
    expect(contributorRoles.length).to.equal(3);
    expect(contributorNames.at(0).props().value).to.equal("An Author");
    expect(contributorRoles.at(0).props().value).to.equal("Author");
    expect(contributorNames.at(1).props().value).to.equal("Another Narrator");
    expect(contributorRoles.at(1).props().value).to.equal("Narrator");
    expect(contributorNames.at(2).props().value).to.be.undefined;
    expect(contributorRoles.at(2).props().value).to.equal("Author");
  });

  it("adds a contributor", () => {
    let editBook = stub();
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    let contributorNames = editableInputByName("contributor-name");
    let contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(4);
    expect(contributorRoles.length).to.equal(4);

    let addContributorName = contributorNames.at(3);
    let addContributorRole = contributorRoles.at(3);
    let addButton = wrapper.find("button.add-contributor");

    addContributorName.at(0).setState({ value: "New Author" });
    addContributorRole.at(0).setState({ value: "Author" });
    addButton.simulate("click");

    contributorNames = editableInputByName("contributor-name");
    contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(5);
    expect(contributorRoles.length).to.equal(5);

    expect(contributorNames.at(0).props().value).to.equal("An Author");
    expect(contributorRoles.at(0).props().value).to.equal("Author");
    expect(contributorNames.at(1).props().value).to.equal("A Narrator");
    expect(contributorRoles.at(1).props().value).to.equal("Narrator");
    expect(contributorNames.at(2).props().value).to.equal("Another Narrator");
    expect(contributorRoles.at(2).props().value).to.equal("Narrator");
    expect(contributorNames.at(3).props().value).to.equal("New Author");
    expect(contributorRoles.at(3).props().value).to.equal("Author");
    expect(contributorNames.at(4).props().value).to.be.undefined;
    expect(contributorRoles.at(4).props().value).to.equal("Author");
  });

  it("calls editBook on submit", () => {
    class MockFormData {
      data: any;
      constructor(form) {
        this.data = {};
        let elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
          let element = elements[i];
          if (!this.data[element.name]) {
            this.data[element.name] = element.value;
          } else if (typeof this.data[element.name] === "string") {
            this.data[element.name] = [this.data[element.name], element.value];
          } else {
            this.data[element.name].push(element.value);
          }
        }
      }

      get(key) {
        return { value: this.data[key] };
      }
    }

    let formDataStub = stub(window, "FormData").callsFake(MockFormData);

    let editBook = stub().returns(new Promise((resolve, reject) => {
      resolve();
    }));
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    let form = wrapper.find("form");
    form.simulate("submit");

    expect(editBook.callCount).to.equal(1);
    expect(editBook.args[0][0]).to.equal("href");
    expect(editBook.args[0][1].data["title"]).to.equal(bookData.title);
    expect(editBook.args[0][1].data["subtitle"]).to.equal(bookData.subtitle);

    // The last contributor field is the empty one for adding a new contributor.
    // If the user had filled it in without clicking "Add", it would still be submitted.
    expect(editBook.args[0][1].data["contributor-name"]).to.deep.equal(["An Author", "A Narrator", "Another Narrator", ""]);
    expect(editBook.args[0][1].data["contributor-role"]).to.deep.equal(["Author", "Narrator", "Narrator", "Author"]);

    expect(editBook.args[0][1].data["series"]).to.equal(bookData.series);
    expect(editBook.args[0][1].data["series_position"]).to.equal(String(bookData.seriesPosition));
    expect(editBook.args[0][1].data["medium"]).to.equal("Audio");
    expect(editBook.args[0][1].data["language"]).to.equal("English");
    expect(editBook.args[0][1].data["publisher"]).to.equal(bookData.publisher);
    expect(editBook.args[0][1].data["imprint"]).to.equal(bookData.imprint);
    expect(editBook.args[0][1].data["issued"]).to.equal(bookData.issued);
    expect(editBook.args[0][1].data["rating"]).to.equal("4");
    expect(editBook.args[0][1].data["summary"]).to.equal(bookData.summary);
    formDataStub.restore();
  });

  it("refreshes book after editing", (done) => {
    let editBook = stub().returns(new Promise((resolve, reject) => {
      resolve();
    }));
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={done}
        editBook={editBook}
      />
    );

    let form = wrapper.find("form");
    form.simulate("submit");
  });

  it("disables all inputs", () => {
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={true}
        refresh={stub()}
        editBook={stub()}
      />
    );
    let inputs = wrapper.find(EditableInput);
    inputs.forEach(input => {
      expect(input.prop("disabled")).to.equal(true);
    });
    let languageField = wrapper.find(LanguageField);
    expect(languageField.prop("disabled")).to.equal(true);
  });
});
