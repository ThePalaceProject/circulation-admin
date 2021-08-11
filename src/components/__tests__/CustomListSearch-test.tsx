import { expect } from "chai";
import { spy, stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearch from "../CustomListSearch";

describe("CustomListSearch", () => {
  let wrapper;
  let search;
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
  beforeEach(() => {
    search = stub();
    wrapper = mount(
      <CustomListSearch
        search={search}
        library={library}
        languages={languages}
      />
    );
  });
  it("searches", () => {
    const input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "test";
    const searchForm = wrapper.find("form");
    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("test");
    expect(search.args[0][1]).to.be.null;
  });
  it("sorts", () => {
    const spySort = spy(wrapper.instance(), "sort");
    wrapper.setProps({ sort: spySort });
    expect(wrapper.state().sortBy).to.be.null;
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

    titleRadio.simulate("change");
    expect(spySort.callCount).to.equal(1);
    expect(spySort.args[0][0]).to.equal("title");
    expect(wrapper.state().sortBy).to.equal("title");

    authorRadio.simulate("change");
    expect(spySort.callCount).to.equal(2);
    expect(spySort.args[1][0]).to.equal("author");
    expect(wrapper.state().sortBy).to.equal("author");

    relevanceRadio.simulate("change");
    expect(spySort.callCount).to.equal(3);
    expect(spySort.args[2][0]).to.be.null;
    expect(wrapper.state().sortBy).to.be.null;

    spySort.restore();
  });
  it("filters by language", () => {
    const languageFieldset = wrapper.find("fieldset").at(2);
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

    languageMenu.getDOMNode().value = "fre";
    languageMenu.simulate("change");
    languageFieldset.closest("form").simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][2]).to.equal("fre");
  });
  it("automatically searches if there is a startingTitle prop", () => {
    const search = stub();
    wrapper = mount(
      <CustomListSearch
        startingTitle="test"
        search={search}
        library={library}
        languages={languages}
      />
    );
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("test");
    expect(search.args[0][1]).to.be.null;
  });
});
