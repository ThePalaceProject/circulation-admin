import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearchAdvancedOptions from "../CustomListSearchAdvancedOptions";

describe("CustomListSearchAdvancedOptions", () => {
  let wrapper;
  let setSortBy;
  let setSelectedLanguage;
  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const selectedLanguage = "all";

  const sortBy = null;

  beforeEach(() => {
    setSortBy = stub();
    setSelectedLanguage = stub();
    wrapper = mount(
      <CustomListSearchAdvancedOptions
        library={library}
        languages={languages}
        sortBy={sortBy}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        setSortBy={setSortBy}
      />
    );
  });

  it("displays sort options", () => {
    const sortOptions = wrapper.find(".search-options").find(".form-group");
    expect(sortOptions.length).to.equal(3);

    const relevance = sortOptions.at(0);
    expect(relevance.text()).to.equal("Relevance (default)");
    const relevanceRadio = relevance.find("input");
    expect(relevanceRadio.props().type).to.equal("radio");
    expect(relevanceRadio.props().name).to.be.null;
    expect(relevanceRadio.props().value).to.equal("");
    expect(relevanceRadio.props().checked).to.be.true;

    const title = sortOptions.at(1);
    expect(title.text()).to.equal("Title");
    const titleRadio = title.find("input");
    expect(titleRadio.props().type).to.equal("radio");
    expect(titleRadio.props().name).to.equal("title");
    expect(titleRadio.props().value).to.equal("title");
    expect(titleRadio.props().checked).to.be.false;

    const author = sortOptions.at(2);
    expect(author.text()).to.equal("Author");
    const authorRadio = author.find("input");
    expect(authorRadio.props().type).to.equal("radio");
    expect(authorRadio.props().name).to.equal("author");
    expect(authorRadio.props().value).to.equal("author");
    expect(authorRadio.props().checked).to.be.false;
  });

  it("displays language options", () => {
    const languageFieldset = wrapper.find("fieldset").at(1);
    expect(languageFieldset.find("legend").text()).to.equal(
      "Filter by language:"
    );
    const languageMenu = languageFieldset.find("select");
    const options = languageMenu.find("option");
    expect(options.at(0).prop("value")).to.equal("all");
    expect(options.at(0).text()).to.equal("All");
    expect(options.at(1).prop("value")).to.equal("eng");
    expect(options.at(1).text()).to.equal("English");
    expect(options.at(2).prop("value")).to.equal("fre");
    expect(options.at(2).text()).to.equal("French");
    expect(options.at(3).prop("value")).to.equal("spa");
    expect(options.at(3).text()).to.equal("Spanish; Castilian");
  });

  it("sets a sort by option", () => {
    const sortOptions = wrapper.find(".search-options").find(".form-group");

    const relevance = sortOptions.at(0);
    const relevanceRadio = relevance.find("input");
    relevanceRadio.simulate("change");
    expect(setSortBy.callCount).to.equal(1);

    const title = sortOptions.at(1);
    const titleRadio = title.find("input");
    titleRadio.simulate("change");
    expect(setSortBy.callCount).to.equal(2);
  });

  it("sets a language", () => {
    const languageFieldset = wrapper.find("fieldset").at(1);
    const languageMenu = languageFieldset.find("select");
    const options = languageMenu.find("option");
    options.at(1).simulate("change");
    expect(setSelectedLanguage.callCount).to.equal(1);
    options.at(2).simulate("change");
    expect(setSelectedLanguage.callCount).to.equal(2);
  });
});
