import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import CustomListSearch from "../CustomListSearch";

describe("CustomListSearch", () => {
  let wrapper;
  let addAdvSearchQuery;
  let search;
  let updateAutoUpdate;
  let updateSearchParam;

  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const entryPoints = ["All", "Book", "Audio"];

  const searchParams = {
    entryPoint: "all",
    terms: "foo bar",
    sort: "title",
    language: "English",
    advanced: {
      include: {
        query: null,
        selectedQueryId: null,
      },
      exclude: {
        query: null,
        selectedQueryId: null,
      },
    },
  };

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  beforeEach(() => {
    addAdvSearchQuery = stub();
    search = stub();
    updateAutoUpdate = stub();
    updateSearchParam = stub();

    wrapper = mount(
      <CustomListSearch
        entryPoints={entryPoints}
        isOwner={true}
        languages={languages}
        library={library}
        listId="123"
        search={search}
        clearFilters={false}
        searchParams={searchParams}
        updateAutoUpdate={updateAutoUpdate}
        updateSearchParam={updateSearchParam}
      />
    );
  });

  it("renders a radio button for each entry point", () => {
    const entryPointOptions = wrapper.find(".entry-points").find(".form-group");

    expect(entryPointOptions.length).to.equal(3);

    const all = entryPointOptions.at(0);

    expect(all.text()).to.equal("All");

    const allRadio = all.find("input");

    expect(allRadio.props().type).to.equal("radio");
    expect(allRadio.props().name).to.equal("entry-points-selection");
    expect(allRadio.props().value).to.equal("All");
    expect(allRadio.props().disabled).to.equal(false);
    expect(allRadio.props().checked).to.be.true;

    const book = entryPointOptions.at(1);

    expect(book.text()).to.equal("Book");

    const bookRadio = book.find("input");

    expect(bookRadio.props().type).to.equal("radio");
    expect(bookRadio.props().name).to.equal("entry-points-selection");
    expect(bookRadio.props().value).to.equal("Book");
    expect(bookRadio.props().disabled).to.equal(false);
    expect(bookRadio.props().checked).to.be.false;

    const audio = entryPointOptions.at(2);

    expect(audio.text()).to.equal("Audio");

    const audioRadio = audio.find("input");

    expect(audioRadio.props().type).to.equal("radio");
    expect(audioRadio.props().name).to.equal("entry-points-selection");
    expect(audioRadio.props().value).to.equal("Audio");
    expect(audioRadio.props().disabled).to.equal(false);
    expect(audioRadio.props().checked).to.be.false;
  });

  it("disables the entry point radio buttons when isOwner is false", () => {
    wrapper.setProps({
      isOwner: false,
    });

    const entryPointOptions = wrapper.find(".entry-points").find(".form-group");

    const all = entryPointOptions.at(0);
    const allRadio = all.find("input");

    expect(allRadio.props().disabled).to.be.true;

    const book = entryPointOptions.at(1);
    const bookRadio = book.find("input");

    expect(bookRadio.props().disabled).to.be.true;

    const audio = entryPointOptions.at(2);
    const audioRadio = audio.find("input");

    expect(audioRadio.props().disabled).to.be.true;
  });

  it("calls updateSearchParam when an entry point radio button is changed", () => {
    const sortOptions = wrapper.find(".entry-points").find(".form-group");
    const audioRadio = sortOptions.at(2).find("input");

    audioRadio.simulate("change");

    expect(updateSearchParam.callCount).to.equal(1);
    expect(updateSearchParam.args[0]).to.deep.equal(["entryPoint", "Audio"]);
  });

  it("renders a radio button for each sort option", () => {
    const sortOptions = wrapper.find(".search-options").find(".form-group");

    expect(sortOptions.length).to.equal(3);

    const relevance = sortOptions.at(0);

    expect(relevance.text()).to.equal("Relevance");

    const relevanceRadio = relevance.find("input");

    expect(relevanceRadio.props().type).to.equal("radio");
    expect(relevanceRadio.props().name).to.equal("sort-selection");
    expect(relevanceRadio.props().value).to.equal("");
    expect(relevanceRadio.props().disabled).to.be.false;
    expect(relevanceRadio.props().checked).to.be.false;

    const title = sortOptions.at(1);

    expect(title.text()).to.equal("Title");

    const titleRadio = title.find("input");

    expect(titleRadio.props().type).to.equal("radio");
    expect(titleRadio.props().name).to.equal("sort-selection");
    expect(titleRadio.props().value).to.equal("title");
    expect(titleRadio.props().disabled).to.be.false;
    expect(titleRadio.props().checked).to.be.true;

    const author = sortOptions.at(2);

    expect(author.text()).to.equal("Author");

    const authorRadio = author.find("input");

    expect(authorRadio.props().type).to.equal("radio");
    expect(authorRadio.props().name).to.equal("sort-selection");
    expect(authorRadio.props().value).to.equal("author");
    expect(authorRadio.props().disabled).to.be.false;
    expect(authorRadio.props().checked).to.be.false;
  });

  it("disables the sort option radio buttons when isOwner is false", () => {
    wrapper.setProps({
      isOwner: false,
    });

    const sortOptions = wrapper.find(".search-options").find(".form-group");

    const relevance = sortOptions.at(0);
    const relevanceRadio = relevance.find("input");

    expect(relevanceRadio.props().disabled).to.be.true;

    const title = sortOptions.at(1);
    const titleRadio = title.find("input");

    expect(titleRadio.props().disabled).to.be.true;

    const author = sortOptions.at(2);
    const authorRadio = author.find("input");

    expect(authorRadio.props().disabled).to.be.true;
  });

  it("calls updateSearchParam when a sort radio button is changed", () => {
    const sortOptions = wrapper.find(".search-options").find(".form-group");
    const authorRadio = sortOptions.at(2).find("input");

    authorRadio.simulate("change");

    expect(updateSearchParam.callCount).to.equal(1);
    expect(updateSearchParam.args[0]).to.deep.equal(["sort", "author"]);
  });

  it("calls addAdvSearchQuery and search when mounted if there is a startingTitle", () => {
    wrapper = mount(
      <CustomListSearch
        entryPoints={entryPoints}
        languages={languages}
        library={library}
        listId="123"
        search={search}
        clearFilters={false}
        searchParams={searchParams}
        startingTitle="test"
        addAdvSearchQuery={addAdvSearchQuery}
      />
    );

    expect(addAdvSearchQuery.callCount).to.equal(1);

    expect(addAdvSearchQuery.args[0]).to.deep.equal([
      "include",
      {
        key: "title",
        op: "eq",
        value: "test",
      },
    ]);

    expect(search.callCount).to.equal(1);
  });

  context("when showAutoUpdate is false", () => {
    it("does not render radio buttons for auto update on and off", () => {
      const autoUpdateOptions = wrapper
        .find(".auto-update")
        .find(".form-group");

      expect(autoUpdateOptions.length).to.equal(0);
    });
  });

  context("when showAutoUpdate is true", () => {
    it("renders radio buttons for auto update on and off", () => {
      wrapper = mount(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={true}
          languages={languages}
          library={library}
          listId={null}
          search={search}
          clearFilters={false}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={updateSearchParam}
        />
      );

      const autoUpdateOptions = wrapper
        .find(".auto-update")
        .find(".form-group");

      expect(autoUpdateOptions.length).to.equal(2);

      const autoUpdateOn = autoUpdateOptions.at(0);

      expect(autoUpdateOn.text()).to.equal("Automatically update this list");

      const autoUpdateOnRadio = autoUpdateOn.find("input");

      expect(autoUpdateOnRadio.props().name).to.equal("auto-update");
      expect(autoUpdateOnRadio.props().disabled).to.be.false;

      const autoUpdateOff = autoUpdateOptions.at(1);

      expect(autoUpdateOff.text()).to.equal("Manually select titles");

      const autoUpdateOffRadio = autoUpdateOff.find("input");

      expect(autoUpdateOffRadio.props().name).to.equal("auto-update");
      expect(autoUpdateOffRadio.props().disabled).to.be.false;
    });

    it("disables the radio buttons for auto update when isOwner is false", () => {
      wrapper = mount(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={false}
          languages={languages}
          library={library}
          listId={null}
          search={search}
          clearFilters={false}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={updateSearchParam}
        />
      );

      const autoUpdateOptions = wrapper
        .find(".auto-update")
        .find(".form-group");

      const autoUpdateOn = autoUpdateOptions.at(0);
      const autoUpdateOnRadio = autoUpdateOn.find("input");

      expect(autoUpdateOnRadio.props().disabled).to.be.true;

      const autoUpdateOff = autoUpdateOptions.at(1);
      const autoUpdateOffRadio = autoUpdateOff.find("input");

      expect(autoUpdateOffRadio.props().disabled).to.be.true;
    });

    it("disables the radio buttons for auto update when listId is not null", () => {
      wrapper = mount(
        <CustomListSearch
          entryPoints={entryPoints}
          isOwner={false}
          languages={languages}
          library={library}
          listId="123"
          search={search}
          clearFilters={false}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={updateSearchParam}
        />
      );

      const autoUpdateOptions = wrapper
        .find(".auto-update")
        .find(".form-group");

      const autoUpdateOn = autoUpdateOptions.at(0);
      const autoUpdateOnRadio = autoUpdateOn.find("input");

      expect(autoUpdateOnRadio.props().disabled).to.be.true;

      const autoUpdateOff = autoUpdateOptions.at(1);
      const autoUpdateOffRadio = autoUpdateOff.find("input");

      expect(autoUpdateOffRadio.props().disabled).to.be.true;
    });

    it("calls updateAutoUpdate when an auto update radio button is changed", () => {
      wrapper = mount(
        <CustomListSearch
          entryPoints={entryPoints}
          languages={languages}
          library={library}
          listId="123"
          search={search}
          clearFilters={false}
          searchParams={searchParams}
          showAutoUpdate={true}
          updateAutoUpdate={updateAutoUpdate}
          updateSearchParam={updateSearchParam}
        />
      );

      const autoUpdateOptions = wrapper
        .find(".auto-update")
        .find(".form-group input");

      const autoUpdateOnRadio = autoUpdateOptions.at(0);
      const autoUpdateOffRadio = autoUpdateOptions.at(1);

      autoUpdateOffRadio.simulate("change");
      autoUpdateOnRadio.simulate("change");

      expect(updateAutoUpdate.callCount).to.equal(2);
      expect(updateAutoUpdate.args[0]).to.deep.equal([false]);
      expect(updateAutoUpdate.args[1]).to.deep.equal([true]);
    });
  });
});
