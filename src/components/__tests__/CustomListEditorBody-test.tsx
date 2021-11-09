import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListEditorBody from "../CustomListEditorBody";
import CustomListEntriesEditor from "../CustomListEntriesEditor";
import EditableInput from "../EditableInput";
import CustomListSearch from "../CustomListSearch";

describe("CustomListEditorBody", () => {
  let wrapper;
  let search;
  let setDraftCollections;
  let addAll;
  let addEntry;
  let deleteAll;
  let deleteEntry;
  let loadMoreEntries;
  let loadMoreSearchResults;
  let setLoadedMoreEntries;
  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };
  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "library",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };
  const entryPoints = ["Book", "Audio"];
  const listData = {
    id: "1",
    url: "some url",
    title: "list",
    lanes: [],
    books: [
      {
        id: "1",
        title: "title 1",
        authors: ["author 1"],
        raw: {
          $: {
            "schema:additionalType": { value: "http://schema.org/EBook" },
          },
        },
      },
      {
        id: "2",
        title: "title 2",
        authors: ["author 2a", "author 2b"],
        raw: {
          $: {
            "schema:additionalType": { value: "http://schema.org/EBook" },
          },
        },
      },
    ],
    navigationLinks: [],
  };
  const collections = [
    {
      id: 1,
      name: "collection 1",
      protocol: "protocol",
      libraries: [{ short_name: "library" }],
    },
    {
      id: 2,
      name: "collection 2",
      protocol: "protocol",
      libraries: [{ short_name: "library" }],
    },
    {
      id: 3,
      name: "collection 3",
      protocol: "protocol",
      libraries: [{ short_name: "library" }],
    },
  ];
  const searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: [],
  };
  const draftCollections = [
    { id: 2, name: "collection 2", protocol: "protocol" },
  ];
  beforeEach(() => {
    search = stub();
    addAll = stub();
    addEntry = stub();
    deleteAll = stub();
    deleteEntry = stub();
    loadMoreEntries = stub();
    loadMoreSearchResults = stub();
    setLoadedMoreEntries = stub();
    wrapper = Enzyme.mount(
      <CustomListEditorBody
        addedListEntries={[]}
        collections={collections}
        deletedListEntries={[]}
        draftCollections={draftCollections}
        draftEntries={listData.books}
        draftTitle={listData.title}
        entryCount="2"
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        languages={languages}
        library={library}
        listId={listData.id}
        searchResults={searchResults}
        startingTitle=""
        addAll={addAll}
        addEntry={addEntry}
        deleteAll={deleteAll}
        deleteEntry={deleteEntry}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        search={search}
        setDraftCollections={setDraftCollections}
        setLoadedMoreEntries={setLoadedMoreEntries}
      />
    );
  });

  it("shows entries editor with list entries and search results", () => {
    const entriesEditor = wrapper.find(CustomListEntriesEditor);
    expect(entriesEditor.length).to.equal(1);
    expect(entriesEditor.props().entries).to.equal(listData.books);
    expect(entriesEditor.props().searchResults).to.equal(searchResults);
    expect(entriesEditor.props().loadMoreSearchResults).to.equal(
      loadMoreSearchResults
    );
    expect(entriesEditor.props().loadMoreEntries).to.equal(loadMoreEntries);
    expect(entriesEditor.props().isFetchingMoreSearchResults).to.equal(false);
    expect(entriesEditor.props().isFetchingMoreCustomListEntries).to.equal(
      false
    );
  });

  it("shows collections", () => {
    const inputs = wrapper.find(EditableInput);
    expect(inputs.length).to.equal(9);
    expect(inputs.at(0).props().label).to.equal("collection 1");
    expect(inputs.at(0).props().value).to.equal("1");
    expect(inputs.at(0).props().checked).to.equal(false);
    expect(inputs.at(1).props().label).to.equal("collection 2");
    expect(inputs.at(1).props().value).to.equal("2");
    expect(inputs.at(1).props().checked).to.equal(true);
    expect(inputs.at(2).props().label).to.equal("collection 3");
    expect(inputs.at(2).props().value).to.equal("3");
    expect(inputs.at(2).props().checked).to.equal(false);
  });

  it("shows entry point options", () => {
    const inputs = wrapper.find(EditableInput);
    expect(inputs.at(3).props().label).to.equal("All");
    expect(inputs.at(3).props().value).to.equal("all");
    expect(inputs.at(3).props().checked).to.equal(true);
    expect(inputs.at(4).props().label).to.equal("Book");
    expect(inputs.at(4).props().value).to.equal("Book");
    expect(inputs.at(4).props().checked).to.equal(false);
    expect(inputs.at(5).props().label).to.equal("Audio");
    expect(inputs.at(5).props().value).to.equal("Audio");
    expect(inputs.at(5).props().checked).to.equal(false);
  });

  it("has a search component", () => {
    let search = wrapper.find(CustomListSearch);
    expect(search.length).to.equal(1);
    expect(search.props().entryPoints).to.eql(wrapper.props().entryPoints);
    wrapper.setProps({ startingTitle: "test" });
    search = wrapper.find(CustomListSearch);
    expect(search.props().startingTitle).to.equal("test");
    expect(search.prop("library")).to.eql(library);
    expect(search.prop("languages")).to.eql(languages);
  });

  it("searches for a language", () => {
    const input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "test";

    let searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    // The default language is "all"
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("/library/search?q=test&language=all");

    const select = wrapper.find(".search-options select") as any;
    select.getDOMNode().value = "eng";
    select.simulate("change");

    searchForm = wrapper.find("form");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(2);
    expect(search.args[1][0]).to.equal("/library/search?q=test&language=eng");
  });

  it("searches with ebooks selected as an entrypoint", () => {
    const textInput = wrapper.find(".form-control") as any;
    textInput.getDOMNode().value = "harry potter";
    const searchForm = wrapper.find("form");
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const bookInput = radioInput.at(1);
    bookInput.simulate("change");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/library/search?q=harry%20potter&entrypoint=Book&language=all"
    );
  });

  it("searches with audiobooks selected as an entrypoint", () => {
    const textInput = wrapper.find(".form-control") as any;
    textInput.getDOMNode().value = "oliver twist";
    const searchForm = wrapper.find("form");
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const bookInput = radioInput.at(2);
    bookInput.simulate("change");
    searchForm.simulate("submit");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/library/search?q=oliver%20twist&entrypoint=Audio&language=all"
    );
  });
});
