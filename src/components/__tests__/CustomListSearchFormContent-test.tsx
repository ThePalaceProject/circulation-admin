import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearchFormContent from "../CustomListSearchFormContent";
import CustomListSearchAdvancedOptions from "../CustomListSearchAdvancedOptions";

describe("CustomListSearchFormContent", () => {
  let wrapper;
  let setSortBy;
  let setSearchTerms;
  let setSelectedEntryPoint;
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
  const searchTerms = "";
  const entryPoints = ["Book", "Audio"];
  const sortBy = null;
  const selectedLanguage = "all";
  const selectedEntryPoint = "All";
  beforeEach(() => {
    setSortBy = stub();
    setSearchTerms = stub();
    setSelectedEntryPoint = stub();
    setSelectedLanguage = stub();
    wrapper = mount(
      <CustomListSearchFormContent
        entryPoints={entryPoints}
        setSelectedEntryPoint={setSelectedEntryPoint}
        selectedEntryPoint={selectedEntryPoint}
        languages={languages}
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        library={library}
      />
    );
  });

  it("displays entry point options", () => {
    const entryPointsFieldset = wrapper
      .find(".entry-points-selection")
      .children();
    expect(entryPointsFieldset.length).to.equal(3);

    const all = entryPointsFieldset.at(0);
    expect(all.text()).to.equal("All");
    const allRadio = all.find("input");
    expect(allRadio.props().type).to.equal("radio");
    expect(allRadio.props().name).to.equal("entry-points-selection");
    expect(allRadio.props().value).to.equal("All");
    expect(allRadio.props().checked).to.be.true;

    const book = entryPointsFieldset.at(1);
    expect(book.text()).to.equal("Book");
    const bookRadio = book.find("input");
    expect(bookRadio.props().type).to.equal("radio");
    expect(bookRadio.props().name).to.equal("entry-points-selection");
    expect(bookRadio.props().value).to.equal("Book");
    expect(bookRadio.props().checked).to.be.false;

    const audio = entryPointsFieldset.at(2);
    expect(audio.text()).to.equal("Audio");
    const audioRadio = audio.find("input");
    expect(audioRadio.props().type).to.equal("radio");
    expect(audioRadio.props().name).to.equal("entry-points-selection");
    expect(audioRadio.props().value).to.equal("Audio");
    expect(audioRadio.props().checked).to.be.false;
  });

  it("has an advanced search options component", () => {
    const advancedSearch = wrapper.find(CustomListSearchAdvancedOptions);
    expect(advancedSearch.length).to.equal(1);
    expect(advancedSearch.props().languages).to.eql(wrapper.props().languages);
    expect(advancedSearch.prop("library")).to.eql(wrapper.props().library);
  });
});
