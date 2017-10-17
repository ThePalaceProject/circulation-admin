import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

const dnd = require("react-beautiful-dnd");
const Droppable = dnd.Droppable;
const Draggable = dnd.Draggable;

import CustomListEntriesEditor from "../CustomListEntriesEditor";

describe("CustomListEntriesEditor", () => {
  let wrapper;
  let onUpdate;
  let loadMoreSearchResults;

  let searchResultsData = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    navigationLinks: [],
    books: [
      { id: "1", title: "result 1", authors: ["author 1"], raw: { "simplified:pwid": [{ "_": "pwid1"}] } },
      { id: "2", title: "result 2", authors: ["author 2a", "author 2b"], raw: { "simplified:pwid": [{ "_": "pwid2"}] } },
      { id: "3", title: "result 3", authors: ["author 3"], raw: { "simplified:pwid": [{ "_": "pwid3"}] } }
    ]
  };

  let entriesData = [
    { pwid: "pwidA", title: "entry A", authors: ["author A"] },
    { pwid: "pwidB", title: "entry B", authors: ["author B1", "author B2"] }
  ];

  beforeEach(() => {
    onUpdate = stub();
    loadMoreSearchResults = stub();
  });

  it("renders search results", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let resultsContainer = wrapper.find(".custom-list-search-results");
    expect(resultsContainer.length).to.equal(1);

    let droppable = resultsContainer.find(Droppable);
    expect(droppable.length).to.equal(1);

    let results = droppable.find(Draggable);
    expect(results.length).to.equal(3);

    expect(results.at(0).text()).to.contain("result 1");
    expect(results.at(0).text()).to.contain("author 1");
    expect(results.at(1).text()).to.contain("result 2");
    expect(results.at(1).text()).to.contain("author 2a, author 2b");
    expect(results.at(2).text()).to.contain("result 3");
    expect(results.at(2).text()).to.contain("author 3");
  });

  it("renders list entries", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let entriesContainer = wrapper.find(".custom-list-entries");
    expect(entriesContainer.length).to.equal(1);

    let droppable = entriesContainer.find(Droppable);
    expect(droppable.length).to.equal(1);

    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(2);

    expect(entries.at(0).text()).to.contain("entry A");
    expect(entries.at(0).text()).to.contain("author A");
    expect(entries.at(1).text()).to.contain("entry B");
    expect(entries.at(1).text()).to.contain("author B1, author B2");
  });

  it("doesn't include search results that are already in the list", () => {
    let entriesData = [
      { pwid: "pwid1", title: "result 1", authors: ["author 1"] }
    ];

    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let resultsContainer = wrapper.find(".custom-list-search-results");
    expect(resultsContainer.length).to.equal(1);

    let droppable = resultsContainer.find(Droppable);
    expect(droppable.length).to.equal(1);

    let results = droppable.find(Draggable);
    expect(results.length).to.equal(2);

    expect(results.at(0).text()).to.contain("result 2");
    expect(results.at(0).text()).to.contain("author 2a, author 2b");
    expect(results.at(1).text()).to.contain("result 3");
    expect(results.at(1).text()).to.contain("author 3");
  });

  it("prevents dragging within search results", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate starting a drag from search results
    (wrapper.instance() as CustomListEntriesEditor).onDragStart({
      draggableId: "pwid1",
      source: {
        droppableId: "search-results"
      }
    });

    let resultsContainer = wrapper.find(".custom-list-search-results");
    let droppable = resultsContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("prevents dragging within list entries", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate starting a drag from list entries
    (wrapper.instance() as CustomListEntriesEditor).onDragStart({
      draggableId: "pwidA",
      source: {
        droppableId: "custom-list-entries"
      }
    });

    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(true);
  });

  it("drags from search results to list entries", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate starting a drag from search results
    (wrapper.instance() as CustomListEntriesEditor).onDragStart({
      draggableId: "pwid1",
      source: {
        droppableId: "search-results"
      }
    });

    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the entries
    (wrapper.instance() as CustomListEntriesEditor).onDragEnd({
      draggableId: "pwid1",
      source: {
        droppableId: "search-results"
      },
      destination: {
        droppableId: "custom-list-entries"
      }
    });

    // the dropped item has been added to entries at the beginning of the list
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(3);
    expect(entries.at(0).text()).to.contain("result 1");
    expect(onUpdate.callCount).to.equal(1);
    const newEntry = { pwid: "pwid1", title: "result 1", authors: ["author 1"] };
    const expectedEntries = [newEntry, entriesData[0], entriesData[1]];
    expect(onUpdate.args[0][0]).to.deep.equal(expectedEntries);
  });

  it("drags from list entries to search results", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate starting a drag from entries
    (wrapper.instance() as CustomListEntriesEditor).onDragStart({
      draggableId: "pwidA",
      source: {
        droppableId: "custom-list-entries"
      }
    });

    let resultsContainer = wrapper.find(".custom-list-search-results");
    let droppable = resultsContainer.find(Droppable);
    expect(droppable.prop("isDropDisabled")).to.equal(false);

    // simulate dropping on the search results
    (wrapper.instance() as CustomListEntriesEditor).onDragEnd({
      draggableId: "pwidA",
      source: {
        droppableId: "custom-list-entries"
      },
      destination: {
        droppableId: "search-results"
      }
    });

    // the dropped item has been removed from entries
    let entriesContainer = wrapper.find(".custom-list-entries");
    droppable = entriesContainer.find(Droppable);
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(1);
    expect(entries.at(0).text()).to.contain("entry B");
    expect(onUpdate.callCount).to.equal(1);
    const expectedEntries = [entriesData[1]];
    expect(onUpdate.args[0][0]).to.deep.equal(expectedEntries);
  });

  it("adds a search result to the list", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let addLink = wrapper.find(".custom-list-search-results .links a");
    addLink.at(0).simulate("click");

    // the item has been added to entries at the beginning of the list
    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(3);
    expect(entries.at(0).text()).to.contain("result 1");
    expect(onUpdate.callCount).to.equal(1);
    const newEntry = { pwid: "pwid1", title: "result 1", authors: ["author 1"] };
    const expectedEntries = [newEntry, entriesData[0], entriesData[1]];
    expect(onUpdate.args[0][0]).to.deep.equal(expectedEntries);
  });

  it("removes an entry from the list", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let deleteLink = wrapper.find(".custom-list-entries .links a");
    deleteLink.at(0).simulate("click");

    // the item has been removed from entries
    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(1);
    expect(entries.at(0).text()).to.contain("entry B");
    expect(onUpdate.callCount).to.equal(1);
    const expectedEntries = [entriesData[1]];
    expect(onUpdate.args[0][0]).to.deep.equal(expectedEntries);
  });

  it("resets", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate dropping a search result on entries
    (wrapper.instance() as CustomListEntriesEditor).onDragEnd({
      draggableId: "pwid1",
      source: {
        droppableId: "search-results"
      },
      destination: {
        droppableId: "custom-list-entries"
      }
    });

    expect((wrapper.instance() as CustomListEntriesEditor).getEntries().length).to.equal(1);
    expect(onUpdate.callCount).to.equal(1);
    (wrapper.instance() as CustomListEntriesEditor).reset();
    expect((wrapper.instance() as CustomListEntriesEditor).getEntries().length).to.equal(0);
    expect(onUpdate.callCount).to.equal(2);

    wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    // simulate dropping an entry on search results
    (wrapper.instance() as CustomListEntriesEditor).onDragEnd({
      draggableId: "pwidA",
      source: {
        droppableId: "custom-list-entries"
      },
      destination: {
        droppableId: "search-results"
      }
    });

    expect((wrapper.instance() as CustomListEntriesEditor).getEntries().length).to.equal(1);
    expect(onUpdate.callCount).to.equal(3);
    (wrapper.instance() as CustomListEntriesEditor).reset();
    expect((wrapper.instance() as CustomListEntriesEditor).getEntries().length).to.equal(2);
    expect(onUpdate.callCount).to.equal(4);
  });

  it("hides add all button when there are no search results", () => {
    let wrapper = shallow(
      <CustomListEntriesEditor
        entries={entriesData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let button = wrapper.find(".add-all-button");
    expect(button.length).to.equal(0);
  });

  it("adds all search results to list", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let button = wrapper.find(".add-all-button");
    button.simulate("click");

    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(5);

    expect(entries.at(0).text()).to.contain("result 1");
    expect(entries.at(1).text()).to.contain("result 2");
    expect(entries.at(2).text()).to.contain("result 3");
    expect(entries.at(3).text()).to.contain("entry A");
    expect(entries.at(4).text()).to.contain("entry B");
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0].length).to.equal(5);
  });

  it("hides delete all button when there are no entries", () => {
    let wrapper = shallow(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let button = wrapper.find(".delete-all-button");
    expect(button.length).to.equal(0);
  });

  it("deletes all entries from list", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    let button = wrapper.find(".delete-all-button");
    button.simulate("click");
    let entriesContainer = wrapper.find(".custom-list-entries");
    let droppable = entriesContainer.find(Droppable);
    let entries = droppable.find(Draggable);
    expect(entries.length).to.equal(0);
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0].length).to.equal(0);
  });

  it("disables load more button when loading more search results", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );
    // When there are no search results at all yet, the button doesn't show.
    let button = wrapper.find(".load-more-button");
    expect(button.length).to.equal(0);

    wrapper.setProps({ searchResults: searchResultsData });
    button = wrapper.find(".load-more-button");
    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).to.be.undefined;

    wrapper.setProps({ isFetchingMoreSearchResults: true });
    button = wrapper.find(".load-more-button");
    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).to.equal(true);
  });

  it("loads more search results", () => {
    let wrapper = mount(
      <CustomListEntriesEditor
        searchResults={searchResultsData}
        entries={entriesData}
        onUpdate={onUpdate}
        loadMoreSearchResults={loadMoreSearchResults}
        isFetchingMoreSearchResults={false}
        />
    );

    let button = wrapper.find(".load-more-button");
    button.simulate("click");
    expect(loadMoreSearchResults.callCount).to.equal(1);
  });
});