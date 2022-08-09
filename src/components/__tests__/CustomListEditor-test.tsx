import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import CustomListEditor from "../CustomListEditor";
import CustomListSearch from "../CustomListSearch";
import TextWithEditMode from "../TextWithEditMode";
import EditableInput from "../EditableInput";
import CustomListEntriesEditor from "../CustomListEntriesEditor";
import * as PropTypes from "prop-types";
import { Button } from "library-simplified-reusable-components";

describe("CustomListEditor", () => {
  let wrapper;
  let reset;
  let save;
  let search;
  let toggleCollection;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let updateSearchParam;
  let childContextTypes;
  let fullContext;

  const searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
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

  const entries = {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  };

  const entryPoints = ["Book", "Audio"];

  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "library",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const properties = {
    name: "Listy McList",
    collections: [2],
  };

  const searchParams = {
    entryPoint: "All",
    terms: "",
    sort: null,
    language: "all",
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

  beforeEach(() => {
    loadMoreEntries = stub();
    loadMoreSearchResults = stub();
    reset = stub();

    save = stub().returns(
      new Promise<void>((resolve) => resolve())
    );

    search = stub();
    toggleCollection = stub();
    updateSearchParam = stub();

    childContextTypes = {
      pathFor: PropTypes.func.isRequired,
      router: PropTypes.object.isRequired,
    };

    fullContext = Object.assign(
      {},
      {
        pathFor: stub().returns("url"),
        router: {
          createHref: stub(),
          push: stub(),
          isActive: stub(),
          replace: stub(),
          go: stub(),
          goBack: stub(),
          goForward: stub(),
          setRouteLeaveHook: stub(),
        },
      }
    );

    wrapper = mount(
      <CustomListEditor
        collections={collections}
        entries={entries}
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={false}
        isFetchingMoreSearchResults={false}
        isModified={true}
        isValid={true}
        languages={languages}
        library={library}
        listId="1"
        properties={properties}
        searchParams={searchParams}
        searchResults={searchResults}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        reset={reset}
        save={save}
        search={search}
        toggleCollection={toggleCollection}
        updateSearchParam={updateSearchParam}
      />,
      { context: fullContext, childContextTypes }
    );
  });

  it("shows the list title", () => {
    const title = wrapper.find(TextWithEditMode);

    expect(title.length).to.equal(1);
    expect(title.props().text).to.equal("Listy McList");
    expect(title.props().placeholder).to.equal("list title");
    expect(title.props().disableIfBlank).to.be.true;
  });

  it("shows the list id", () => {
    const listId = wrapper.find(".custom-list-editor-header h4");

    expect(listId.length).to.equal(1);
    expect(listId.text()).to.contain("1");
  });

  it("shows an entries editor with list entries and search results", () => {
    const entriesEditor = wrapper.find(CustomListEntriesEditor);

    expect(entriesEditor.length).to.equal(1);
    expect(entriesEditor.props().entries).to.equal(entries.current);
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
    const collectionsPanel = wrapper.find("#add-from-collections-panel");
    const inputs = collectionsPanel.find(EditableInput);

    expect(inputs.length).to.equal(3);

    expect(inputs.at(0).props().label).to.equal("collection 1");
    expect(inputs.at(0).props().value).to.equal(1);
    expect(inputs.at(0).props().checked).to.equal(false);

    expect(inputs.at(1).props().label).to.equal("collection 2");
    expect(inputs.at(1).props().value).to.equal(2);
    expect(inputs.at(1).props().checked).to.equal(true);

    expect(inputs.at(2).props().label).to.equal("collection 3");
    expect(inputs.at(2).props().value).to.equal(3);
    expect(inputs.at(2).props().checked).to.equal(false);
  });

  it("shows entry point options", () => {
    const inputs = wrapper.find(EditableInput);

    expect(inputs.at(3).props().label).to.equal("All");
    expect(inputs.at(3).props().value).to.equal("All");
    expect(inputs.at(3).props().checked).to.equal(true);

    expect(inputs.at(4).props().label).to.equal("Book");
    expect(inputs.at(4).props().value).to.equal("Book");
    expect(inputs.at(4).props().checked).to.equal(false);

    expect(inputs.at(5).props().label).to.equal("Audio");
    expect(inputs.at(5).props().value).to.equal("Audio");
    expect(inputs.at(5).props().checked).to.equal(false);
  });

  it("enables the save button when the list has changes and is valid", () => {
    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);

    expect(saveButton.props().disabled).to.equal(false);
  });

  it("disables the save button when the list does not have changes", () => {
    wrapper.setProps({ isModified: false });

    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);

    expect(saveButton.length).to.equal(1);
    expect(saveButton.props().disabled).to.equal(true);
  });

  it("disables the save button when the list is invalid", () => {
    wrapper.setProps({ isValid: false });

    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);

    expect(saveButton.length).to.equal(1);
    expect(saveButton.props().disabled).to.equal(true);
  });

  it("calls save when the save button is clicked", () => {
    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);

    expect(saveButton.length).to.equal(1);

    saveButton.simulate("click");

    expect(save.callCount).to.equal(1);
  });

  it("disables the cancel button when the list does not have changes", () => {
    wrapper.setProps({ isModified: false });

    const cancelButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(1);

    expect(cancelButton.length).to.equal(1);
    expect(cancelButton.props().disabled).to.equal(true);
  });

  it("calls reset when the cancel button is clicked", () => {
    const cancelButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(1);

    expect(cancelButton.length).to.equal(1);

    cancelButton.simulate("click");

    expect(reset.callCount).to.equal(1);
  });

  it("calls toggleCollection when a collection checkbox is changed", () => {
    const inputs = wrapper.find(".collections input");

    inputs.at(1).simulate("change");

    expect(toggleCollection.callCount).to.equal(1);
    expect(toggleCollection.args[0]).to.deep.equal([2]);
  });

  it("renders a CustomListSearch component", () => {
    wrapper.setProps({ startingTitle: "Begin the Begin" });

    const customListSearch = wrapper.find(CustomListSearch);

    expect(customListSearch.length).to.equal(1);
    expect(customListSearch.prop("entryPoints")).to.equal(entryPoints);
    expect(customListSearch.prop("languages")).to.equal(languages);
    expect(customListSearch.prop("library")).to.equal(library);
    expect(customListSearch.prop("searchParams")).to.equal(searchParams);
    expect(customListSearch.prop("startingTitle")).to.equal("Begin the Begin");
    expect(customListSearch.prop("search")).to.equal(search);
    expect(customListSearch.prop("updateSearchParam")).to.equal(
      updateSearchParam
    );
  });
});
