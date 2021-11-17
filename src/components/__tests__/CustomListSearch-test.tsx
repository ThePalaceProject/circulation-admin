import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearch from "../CustomListSearch";
import CustomListSearchFormContent from "../CustomListSearchFormContent";

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

  const entryPoints = ["Book", "Audio"];
  beforeEach(() => {
    search = stub();
    wrapper = mount(
      <CustomListSearch
        search={search}
        library={library}
        languages={languages}
        entryPoints={entryPoints}
      />
    );
  });

  it("searches", () => {
    const input = wrapper.find(".form-control") as any;
    input.simulate("change", { target: { value: "test" } });
    const searchForm = wrapper.find("form");
    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&language=all"
    );
  });

  it("searches for a language", () => {
    const input = wrapper.find(".form-control") as any;
    input.simulate("change", { target: { value: "test" } });

    const languageFieldset = wrapper.find("fieldset").at(2);
    const languageMenu = languageFieldset.find("select");

    languageMenu.getDOMNode().value = "fre";
    languageMenu.simulate("change");
    const searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&language=fre"
    );
  });

  it("searches with ebooks selected as an entrypoint", () => {
    const input = wrapper.find(".form-control") as any;
    input.simulate("change", { target: { value: "test" } });
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const bookInput = radioInput.at(1);
    bookInput.simulate("change");
    const searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&entrypoint=Book&language=all"
    );
  });

  it("searches with audiobooks selected as an entrypoint", () => {
    const input = wrapper.find(".form-control") as any;
    input.simulate("change", { target: { value: "test" } });
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const bookInput = radioInput.at(2);
    bookInput.simulate("change");
    const searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&entrypoint=Audio&language=all"
    );
  });

  it("sorts", () => {
    let formContent = wrapper.find(CustomListSearchFormContent);
    expect(formContent.props().sortBy).to.equal(null);
    const sortOptions = wrapper.find(".search-options").find(".form-group");

    const relevance = sortOptions.at(0);
    const relevanceRadio = relevance.find("input");

    const title = sortOptions.at(1);
    const titleRadio = title.find("input");

    const author = sortOptions.at(2);
    const authorRadio = author.find("input");

    const input = wrapper.find(".form-control") as any;
    input.simulate("change", { target: { value: "test" } });

    titleRadio.simulate("change");
    formContent = wrapper.find(CustomListSearchFormContent);
    expect(formContent.props().sortBy).to.equal("title");
    let searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&order=title&language=all"
    );

    authorRadio.simulate("change");
    formContent = wrapper.find(CustomListSearchFormContent);
    expect(formContent.props().sortBy).to.equal("author");
    searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.args[1][0]).to.equal(
      "/short_name/search?q=test&order=author&language=all"
    );

    relevanceRadio.simulate("change");
    formContent = wrapper.find(CustomListSearchFormContent);
    expect(formContent.props().sortBy).to.equal(null);
    searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.args[2][0]).to.equal(
      "/short_name/search?q=test&language=all"
    );
  });

  it("automatically searches if there is a startingTitle prop", () => {
    wrapper = mount(
      <CustomListSearch
        startingTitle="test"
        search={search}
        library={library}
        languages={languages}
      />
    );
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/short_name/search?q=test&language=all"
    );
  });
});
