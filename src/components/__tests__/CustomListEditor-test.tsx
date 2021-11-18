import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListEditor from "../CustomListEditor";
import CustomListEditorHeader from "../CustomListEditorHeader";
import CustomListEditorBody from "../CustomListEditorBody";
import { Button } from "library-simplified-reusable-components";
import { Droppable, Draggable } from "react-beautiful-dnd";
import * as PropTypes from "prop-types";
import CustomListBuilder from "../CustomListBuilder";

describe("CustomListEditor", () => {
  let wrapper;
  const languages = {
    eng: ["English"],
  };

  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "library",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

  const listData = {
    id: "1",
    url: "some url",
    title: "original list title",
    lanes: [],
    books: [
      {
        id: "A",
        title: "entry A",
        authors: ["author 1"],
        raw: {
          $: {
            "schema:additionalType": { value: "http://schema.org/EBook" },
          },
        },
      },
      {
        id: "B",
        title: "entry B",
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

  const searchResultsData = {
    id: "id",
    url: "url",
    title: "title - search",
    lanes: [],
    navigationLinks: [],
    books: [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        url: "/some/url1",
        language: "eng",
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
      {
        id: "2",
        title: "result 2",
        authors: ["author 2a", "author 2b"],
        url: "/some/url2",
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
      {
        id: "3",
        title: "result 3",
        authors: ["author 3"],
        url: "/some/url3",
        language: "eng",
        raw: {
          $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
        },
      },
    ],
  };
  const listCollections = [
    { id: 2, name: "collection 2", protocol: "protocol" },
  ];

  const generateEntries = (num: number, offset: number = 0) => {
    return Array.from(new Array(num), (x, i) => i + offset).map((n) => ({
      id: `${n}`,
      title: `title-${n}`,
      url: "",
      authors: [],
      language: "eng",
      raw: {
        $: {
          "schema:additionalType": { value: "http://bib.schema.org/Audiobook" },
        },
      },
    }));
  };

  let editCustomList;
  let search;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let fullContext;
  let childContextTypes;

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
    fullContext = {
      ...{
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
      },
    };

    wrapper = Enzyme.mount(
      <CustomListEditor
        languages={languages}
        library={library}
        list={listData}
        listCollections={listCollections}
        listId="1"
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        searchResults={searchResultsData}
      />,
      { context: fullContext, childContextTypes }
    );
  });

  it("renders Header and Body components", () => {
    expect(wrapper.find(CustomListEditorHeader)).to.be.ok;
    expect(wrapper.find(CustomListEditorBody)).to.be.ok;
  });

  it("knows if list title has changed", () => {
    let header = wrapper.find(CustomListEditorHeader);
    expect(header.props().hasListInfoChanged).to.equal(false);
    // saveEditTitleButton starts as "Edit list title".
    let saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    // Once clicked, it changes to "Save list title" and the input appears.
    saveEditTitleButton.simulate("click");
    const input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "new list title";
    saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    saveEditTitleButton.simulate("click");
    header = wrapper.find(CustomListEditorHeader);
    expect(header.props().hasListInfoChanged).to.equal(true);
  });

  it("adds a search result to the list, and adds to addedListEntries", () => {
    let display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");

    const addLink = wrapper
      .find(".custom-list-search-results .links")
      .find(Button);
    addLink.at(0).simulate("click");

    // the item has been added to entries at the beginning of the list
    const entriesContainer = wrapper.find(".custom-list-entries");
    const droppable = entriesContainer.find(Droppable);
    const entries = droppable.find(Draggable);
    expect(entries.length).to.equal(3);
    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 3 of 3 Books");
    expect(entries.at(0).text()).to.contain("result 1");
    const builder = wrapper.find(CustomListBuilder);
    expect(builder.props().addedListEntries.length).to.equal(1);
  });

  it("removes an entry from the list, and adds to deletedListEntries", () => {
    let display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");

    const deleteLink = wrapper.find(".custom-list-entries .links").find(Button);
    deleteLink.at(0).simulate("click");

    // the item has been removed from entries
    const entriesContainer = wrapper.find(".custom-list-entries");
    const droppable = entriesContainer.find(Droppable);
    const entries = droppable.find(Draggable);
    expect(entries.length).to.equal(1);
    expect(entries.at(0).text()).to.contain("entry B");
    const builder = wrapper.find(CustomListBuilder);
    expect(builder.props().deletedListEntries.length).to.equal(1);

    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 1 of 1 Book");
  });

  it("adds all search results to list", () => {
    let display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");

    const button = wrapper.find(".add-all-button").at(0);
    button.simulate("click");

    const entriesContainer = wrapper.find(".custom-list-entries");
    const droppable = entriesContainer.find(Droppable);
    const entries = droppable.find(Draggable);
    expect(entries.length).to.equal(5);

    expect(entries.at(0).text()).to.contain("result 1");
    expect(entries.at(1).text()).to.contain("result 2");
    expect(entries.at(2).text()).to.contain("result 3");
    expect(entries.at(3).text()).to.contain("entry A");
    expect(entries.at(4).text()).to.contain("entry B");

    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 5 of 5 Books");
  });

  it("deletes all entries from an existing list", () => {
    let display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");

    const button = wrapper.find(".delete-all-button").at(0);
    button.simulate("click");
    const entriesContainer = wrapper.find(".custom-list-entries");
    const droppable = entriesContainer.find(Droppable);
    const entries = droppable.find(Draggable);
    expect(entries.length).to.equal(0);

    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("No books in this list");
  });

  it("deletes all entries from a new list", () => {
    wrapper = Enzyme.mount(
      <CustomListEditor
        languages={languages}
        library={library}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        searchResults={searchResultsData}
      />,
      { context: fullContext, childContextTypes }
    );

    let display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("No books in this list");

    const addLink = wrapper
      .find(".custom-list-search-results .links")
      .find(Button);
    addLink.at(0).simulate("click");

    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("Displaying 1 - 1 of 1 Book");

    const button = wrapper.find(".delete-all-button").at(0);
    button.simulate("click");
    const entriesContainer = wrapper.find(".custom-list-entries");
    const droppable = entriesContainer.find(Droppable);
    const entries = droppable.find(Draggable);
    expect(entries.length).to.equal(0);

    display = wrapper.find(".custom-list-entries h4");
    expect(display.text()).to.equal("No books in this list");
  });

  it("cancels changes", () => {
    let listTitle = wrapper.find("h3").at(0);
    expect(listTitle.text()).to.include("original list title");
    let saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    saveEditTitleButton.simulate("click");

    const input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "new list title";
    saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    saveEditTitleButton.simulate("click");
    listTitle = wrapper.find("h3").at(0);
    expect(listTitle.text()).to.include("new list title");
    const cancelChangesButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(1);
    expect(cancelChangesButton.props().disabled).to.equal(false);
    cancelChangesButton.simulate("click");

    listTitle = wrapper.find("h3").at(0);
    expect(listTitle.text()).to.include("original list title");
  });

  it("saves list", () => {
    let saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    saveEditTitleButton.simulate("click");

    const input = wrapper.find(".form-control") as any;
    input.getDOMNode().value = "new list title";
    saveEditTitleButton = wrapper.find(".btn.inverted.inline");
    saveEditTitleButton.simulate("click");

    const saveListButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(0);
    saveListButton.simulate("click");
    expect(editCustomList.callCount).to.equal(1);
    const formData = editCustomList.args[0][0];
    expect(formData.get("id")).to.equal("1");
    expect(formData.get("name")).to.equal("new list title");
    const listId = editCustomList.args[0][1];
    expect(listId).to.equal("1");
  });

  it("switches to the edit form after a new form is saved", () => {
    wrapper = Enzyme.mount(
      <CustomListEditor
        languages={languages}
        library={library}
        editCustomList={editCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />
    );
    Object.defineProperty(window.location, "href", {
      writable: true,
      value: "/admin/web/lists/library/create",
    });
    wrapper.setProps({ responseBody: "1" });
    expect(window.location.href).not.to.contain("create");
    expect(window.location.href).to.contain("edit");
    expect(window.location.href).to.contain("1");
  });

  it("should properly display how many books are in the entry list", () => {
    let display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal("Displaying 1 - 2 of 2 Books");

    let deleteLink = wrapper.find(".custom-list-entries .links").find(Button);
    deleteLink.at(0).simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 1 of 1 Book");

    deleteLink.at(0).simulate("click");

    expect(display.text()).to.equal("No books in this list");

    const addLink = wrapper
      .find(".custom-list-search-results .links")
      .find(Button);
    addLink.at(0).simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 1 of 1 Book");

    addLink.at(1).simulate("click");
    addLink.at(2).simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 3 of 3 Books");

    // Add more search results and entries
    const newEntries = generateEntries(10);
    const newSearchResultsData = generateEntries(20, 20);

    wrapper.setProps({
      searchResults: { ...searchResultsData, books: newSearchResultsData },
      list: { ...listData, books: newEntries },
    });

    let searchEntries = wrapper.find(".custom-list-search-results li");

    expect(searchEntries.length).to.equal(newSearchResultsData.length);

    display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal("Displaying 1 - 10 of 10 Books");

    let addAllBtn = wrapper.find(".add-all-button").at(0);
    addAllBtn.simulate("click");

    // // All search results were added to the entries.
    searchEntries = wrapper.find(".custom-list-search-results li");
    expect(searchEntries.length).to.equal(0);
    expect(display.text()).to.equal("Displaying 1 - 30 of 30 Books");

    deleteLink = wrapper.find(".custom-list-entries .links").find(Button);
    deleteLink.at(0).simulate("click");
    deleteLink.at(1).simulate("click");
    deleteLink.at(2).simulate("click");
    deleteLink.at(3).simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 26 of 26 Books");

    const deleteAllBtn = wrapper.find(".delete-all-button").at(0);
    deleteAllBtn.simulate("click");

    expect(display.text()).to.equal("No books in this list");

    // All search results should be back in the search results list
    searchEntries = wrapper.find(".custom-list-search-results li");
    expect(searchEntries.length).to.equal(newSearchResultsData.length);

    addAllBtn = wrapper.find(".add-all-button").at(0);
    addAllBtn.simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 20 of 20 Books");

    deleteLink = wrapper.find(".custom-list-entries .links").find(Button);
    deleteLink.at(0).simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 19 of 19 Books");

    const cancelButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(1);

    cancelButton.simulate("click");

    expect(display.text()).to.equal("Displaying 1 - 10 of 10 Books");
    // All the search results should be back in the search result list.
    searchEntries = wrapper.find(".custom-list-search-results li");
    expect(searchEntries.length).to.equal(newSearchResultsData.length);
  });
});
