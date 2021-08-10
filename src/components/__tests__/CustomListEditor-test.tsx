import { expect } from "chai";
import { stub, useFakeTimers } from "sinon";

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
  let editCustomList;
  let search;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let childContextTypes;
  let fullContext;

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
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
      {
        id: "2",
        title: "title 2",
        authors: ["author 2a", "author 2b"],
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
    ],
    navigationLinks: [],
  };
  const listCollections = [
    { id: 2, name: "collection 2", protocol: "protocol" },
  ];

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

  beforeEach(() => {
    editCustomList = stub().returns(
      new Promise<void>((resolve) => resolve())
    );
    search = stub();
    loadMoreSearchResults = stub();
    loadMoreEntries = stub();
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
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
  });

  it("shows list title", () => {
    const title = wrapper.find(TextWithEditMode);
    expect(title.length).to.equal(1);
    expect(title.props().text).to.equal("list");
    expect(title.props().placeholder).to.equal("list title");
    expect(title.props().disableIfBlank).to.be.true;
  });

  it("shows list id", () => {
    const listId = wrapper.find(".custom-list-editor-header h4");
    expect(listId.length).to.equal(1);
    expect(listId.text()).to.contain("1");
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

  it("saves list", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    const getTextStub = stub(TextWithEditMode.prototype, "getText").returns(
      "new list title"
    );
    const newEntries = [{ id: "urn1" }, { id: "urn2" }];
    wrapper.setState({ title: "new list title" });
    const getEntriesStub = stub(
      CustomListEntriesEditor.prototype,
      "getEntries"
    ).returns(newEntries);
    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);
    saveButton.simulate("click");

    expect(editCustomList.callCount).to.equal(1);
    const formData = editCustomList.args[0][0];
    expect(formData.get("id")).to.equal("1");
    expect(formData.get("name")).to.equal("new list title");
    expect(formData.get("entries")).to.equal(JSON.stringify(newEntries));
    expect(formData.get("collections")).to.equal(JSON.stringify([2]));
    const listId = editCustomList.args[0][1];
    expect(listId).to.equal("1");

    getTextStub.restore();
    getEntriesStub.restore();
  });

  it("shouldn't allow you to save unless the list has a title", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );

    let saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);
    expect(saveButton.props().disabled).to.equal(true);

    wrapper.setState({ title: "new list title" });
    saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);

    expect(saveButton.props().disabled).to.equal(false);
  });

  it("navigates to edit page after a new list is created", async () => {
    // Set window.location.href to be writable, jsdom doesn't normally allow changing it but browsers do.
    // Start on the create page.
    Object.defineProperty(window.location, "href", {
      writable: true,
      value: "/admin/web/lists/library/create",
    });

    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    const getTextStub = stub(TextWithEditMode.prototype, "getText").returns(
      "new list title"
    );
    const newEntries = [{ id: "urn1" }, { id: "urn2" }];
    const getEntriesStub = stub(
      CustomListEntriesEditor.prototype,
      "getEntries"
    ).returns(newEntries);
    const saveButton = wrapper.find(".save-or-cancel-list").find(Button).at(0);
    wrapper.setState({ title: "new list title" });
    saveButton.simulate("click");

    expect(editCustomList.callCount).to.equal(1);
    getTextStub.restore();
    getEntriesStub.restore();

    wrapper.setProps({ responseBody: "5" });
    // Let the call stack clear so the callback after editCustomList will run.
    const pause = (): Promise<void> => {
      return new Promise<void>((resolve) => setTimeout(resolve, 0));
    };
    await pause();
    expect(window.location.href).to.contain("edit");
    expect(window.location.href).to.contain("5");
  });

  it("cancels changes", () => {
    const listTitleReset = stub(TextWithEditMode.prototype, "reset");
    const listEntriesReset = stub(CustomListEntriesEditor.prototype, "reset");
    this.clock = useFakeTimers();

    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );

    // the cancel button isn't shown when there are no changes.
    let cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as CustomListEditor).changeTitle("new name");
    wrapper.update();

    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");
    this.clock.tick(200);

    expect(listTitleReset.callCount).to.equal(1);
    expect(listEntriesReset.callCount).to.equal(1);

    (wrapper.instance() as CustomListEditor).changeTitle(listData.title);
    wrapper.update();
    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as CustomListEditor).changeCollection(collections[0]);
    // This is needed because we are testing the cancelButton again.
    wrapper.update();

    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");
    this.clock.tick(200);
    wrapper.update();

    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(0);

    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    (wrapper.instance() as CustomListEditor).changeEntries([
      { id: "1234", title: "a", authors: [] },
    ]);
    wrapper.update();

    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");
    this.clock.tick(200);

    expect(listTitleReset.callCount).to.equal(3);
    expect(listEntriesReset.callCount).to.equal(3);
    cancelButton = wrapper.find(".save-or-cancel-list").find(Button).at(1);

    (wrapper.instance() as CustomListEditor).changeEntries(listData.books);
    wrapper.update();

    const buttons = wrapper.find(".save-or-cancel-list").find(Button);
    expect(buttons.length).to.equal(1);

    listTitleReset.restore();
    listEntriesReset.restore();
    this.clock.restore();
  });

  it("changes selected collections", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        collections={collections}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );

    let inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(false);
    expect(inputs.at(1).props().checked).to.equal(true);

    inputs.at(0).props().onChange();
    wrapper.update();
    inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(true);
    expect(inputs.at(1).props().checked).to.equal(true);

    inputs.at(1).props().onChange();
    wrapper.update();
    inputs = wrapper.find(EditableInput);
    expect(inputs.at(0).props().checked).to.equal(true);
    expect(inputs.at(1).props().checked).to.equal(false);
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
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
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

  it("optionally searches a title passed as a prop", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryPoints={entryPoints}
        startingTitle="test title"
      />,
      { context: fullContext, childContextTypes }
    );
    const searchField = wrapper.find(".form-control");
    expect(searchField.getDOMNode().value).to.equal("test title");
    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/library/search?q=test%20title&language=all"
    );
  });

  it("searches with audiobooks selected", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        collections={collections}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    const textInput = wrapper.find(".form-control") as any;
    textInput.getDOMNode().value = "harry potter";
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const bookInput = radioInput.at(1);
    const searchForm = wrapper.find("form");

    bookInput.checked = true;
    bookInput.simulate("change");

    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/library/search?q=harry%20potter&entrypoint=Book&language=all"
    );
  });

  it("searches with ebook selected", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        collections={collections}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    const textInput = wrapper.find(".form-control") as any;
    textInput.getDOMNode().value = "oliver twist";
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const audioInput = radioInput.at(2);
    const searchForm = wrapper.find("form");

    audioInput.checked = true;
    audioInput.simulate("change");

    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal(
      "/library/search?q=oliver%20twist&entrypoint=Audio&language=all"
    );
  });

  it("should keep the same state when the list prop gets updated", () => {
    wrapper = mount(
      <CustomListEditor
        library={library}
        languages={languages}
        list={listData}
        listId="1"
        listCollections={listCollections}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        collections={collections}
        entryPoints={entryPoints}
      />,
      { context: fullContext, childContextTypes }
    );
    const updatedList = { id: 2, name: "updated list", collections: [] };
    const newList = Object.assign({}, updatedList, { books: [] });
    const radioInput = wrapper.find(".entry-points-selection input") as any;
    const audioInput = radioInput.at(2);
    const textInput = wrapper.find(".form-control") as any;

    textInput.getDOMNode().value = "oliver twist";
    audioInput.checked = true;
    audioInput.simulate("change");

    expect(wrapper.props().list).to.deep.equal(listData);
    expect(textInput.getDOMNode().value).to.equal("oliver twist");
    expect(wrapper.state("entryPointSelected")).to.equal("Audio");

    // Update the component with a new list.
    wrapper.setProps({ identifier: "2", list: newList });

    expect(wrapper.props().list).to.deep.equal(newList);
    expect(textInput.getDOMNode().value).to.equal("oliver twist");
    expect(wrapper.state("entryPointSelected")).to.equal("Audio");
  });

  describe("hasChanges", () => {
    it("should update correctly", () => {
      wrapper = mount(
        <CustomListEditor
          library={library}
          languages={languages}
          searchResults={searchResults}
          editCustomList={editCustomList}
          search={search}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          entryPoints={entryPoints}
        />,
        { context: fullContext, childContextTypes }
      );

      let hasChanges = (wrapper.instance() as CustomListEditor).hasChanges();

      expect(hasChanges).to.equal(false);

      // A new list with a new title
      wrapper.setState({ title: "Updated title" });
      hasChanges = (wrapper.instance() as CustomListEditor).hasChanges();

      expect(hasChanges).to.equal(true);

      // We decided to add an entry
      (wrapper.instance() as CustomListEditor).changeEntries([
        { id: "1234", title: "a", authors: [] },
      ]);
      hasChanges = (wrapper.instance() as CustomListEditor).hasChanges();
      expect(hasChanges).to.equal(true);

      wrapper = mount(
        <CustomListEditor
          library={library}
          languages={languages}
          searchResults={searchResults}
          editCustomList={editCustomList}
          search={search}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          entryPoints={entryPoints}
        />,
        { context: fullContext, childContextTypes }
      );

      (wrapper.instance() as CustomListEditor).changeEntries([
        { id: "1234", title: "a", authors: [] },
      ]);
      hasChanges = (wrapper.instance() as CustomListEditor).hasChanges();
      expect(hasChanges).to.equal(true);

      // Now add a title
      wrapper.setState({ title: "Updated title" });
      hasChanges = (wrapper.instance() as CustomListEditor).hasChanges();

      expect(hasChanges).to.equal(true);
    });
  });
  it("should know whether the list title is blank", () => {
    // There is a list property with a title
    expect(wrapper.instance().isTitleEmpty()).to.be.false;
    wrapper.setProps({ list: null });
    wrapper.setState({ title: null });
    // New list, no title
    expect(wrapper.instance().isTitleEmpty()).to.be.true;
    // New list, title is still just the placeholder
    wrapper.setState({ title: "list title" });
    expect(wrapper.instance().isTitleEmpty()).to.be.true;
    // New list, placeholder has been deleted.
    wrapper.setState({ title: "" });
    expect(wrapper.instance().isTitleEmpty()).to.be.true;
    // Adding a title...
    wrapper.setState({ title: "testing..." });
    expect(wrapper.instance().isTitleEmpty()).to.be.false;
  });
});
