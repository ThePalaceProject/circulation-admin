import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import CustomListEntriesEditor from "../CustomListEntriesEditor";

import { AudioHeadphoneIcon, BookIcon } from "@nypl/dgx-svg-icons";
import * as PropTypes from "prop-types";

describe("CustomListEntriesEditor", () => {
  let addAllEntries;
  let addEntry;
  let deleteAllEntries;
  let deleteEntry;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let refreshResults;
  let childContextTypes;
  let fullContext;

  const searchResultsData = {
    id: "id",
    url: "url",
    title: "title",
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

  const entriesData = [
    {
      id: "A",
      title: "entry A",
      authors: ["author A"],
      url: "/some/urlA",
      raw: {
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      },
    },
    {
      id: "B",
      title: "entry B",
      authors: ["author B1", "author B2"],
      url: "/some/urlB",
      raw: {
        $: {
          "schema:additionalType": { value: "http://bib.schema.org/Audiobook" },
        },
      },
    },
  ];

  beforeEach(() => {
    addAllEntries = stub();
    addEntry = stub();
    deleteAllEntries = stub();
    deleteEntry = stub();
    loadMoreSearchResults = stub();
    loadMoreEntries = stub();
    refreshResults = stub();

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
  });

  it("renders search results", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");

    expect(resultsContainer.length).to.equal(1);

    const droppable = resultsContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const results = droppable.find(Draggable);

    expect(results.length).to.equal(3);
    expect(results.at(0).text()).to.contain("result 1");
    expect(results.at(0).text()).to.contain("author 1");
    expect(results.at(1).text()).to.contain("result 2");
    expect(results.at(1).text()).to.contain("author 2a, author 2b");
    expect(results.at(2).text()).to.contain("result 3");
    expect(results.at(2).text()).to.contain("author 3");
  });

  it("does not render search results when isOwner is false", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={false}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");

    expect(resultsContainer.length).to.equal(0);
  });

  it("calls refreshResults when the refresh button is clicked", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        refreshResults={refreshResults}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const refreshButton = wrapper.find(".btn.refresh-button");

    refreshButton.at(0).simulate("click");

    expect(refreshResults.callCount).to.equal(1);
  });

  it("disables the refresh button when isFetchingSearchResults is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        refreshResults={refreshResults}
        isFetchingSearchResults={true}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const refreshButton = wrapper.find(".btn.refresh-button");

    expect(refreshButton.prop("disabled")).to.equal(true);
  });

  it("disables the refresh button when isFetchingSearchResults is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        refreshResults={refreshResults}
        isFetchingSearchResults={true}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const refreshButton = wrapper.find(".btn.refresh-button");

    expect(refreshButton.prop("disabled")).to.equal(true);
  });

  it("shows a loading message when isFetchingSearchResults is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        refreshResults={refreshResults}
        isFetchingSearchResults={true}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const loadingIndicator = wrapper.find(".list-loading");

    expect(loadingIndicator.length).to.equal(1);
    expect(loadingIndicator.text()).to.contain("Loading");
  });

  it("renders a link to view each search result", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");

    expect(resultsContainer.length).to.equal(1);

    const droppable = resultsContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const results = droppable.find(Draggable);

    expect(results.length).to.equal(3);

    expect(results.at(0).find("CatalogLink").text()).to.equal("View details");
    expect(results.at(0).find("CatalogLink").prop("bookUrl")).to.equal(
      "/some/url1"
    );

    expect(results.at(1).find("CatalogLink").text()).to.equal("View details");
    expect(results.at(1).find("CatalogLink").prop("bookUrl")).to.equal(
      "/some/url2"
    );

    expect(results.at(2).find("CatalogLink").text()).to.equal("View details");
    expect(results.at(2).find("CatalogLink").prop("bookUrl")).to.equal(
      "/some/url3"
    );
  });

  it("renders an SVG icon for each search result", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");
    const audioSVGs = resultsContainer.find(AudioHeadphoneIcon);
    const bookSVGs = resultsContainer.find(BookIcon);

    expect(audioSVGs.length).to.equal(1);
    expect(bookSVGs.length).to.equal(2);
  });

  it("doesn't render an SVG icon for books with a bad medium value", () => {
    searchResultsData.books[2].raw["$"]["schema:additionalType"].value = "";

    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");
    const audioSVGs = resultsContainer.find(AudioHeadphoneIcon);
    const bookSVGs = resultsContainer.find(BookIcon);

    expect(audioSVGs.length).to.equal(1);
    expect(bookSVGs.length).to.equal(1);

    searchResultsData.books[2].raw["$"]["schema:additionalType"].value =
      "http://schema.org/EBook";
  });

  it("does not render list entries when autoUpdate is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        autoUpdate={true}
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const entriesContainer = wrapper.find(".custom-list-entries");

    expect(entriesContainer.length).to.equal(0);
  });

  it("renders list entries when autoUpdate is false", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        autoUpdate={false}
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const entriesContainer = wrapper.find(".custom-list-entries");

    expect(entriesContainer.length).to.equal(1);

    const droppable = entriesContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const entries = droppable.find(Draggable);

    expect(entries.length).to.equal(2);

    expect(entries.at(0).text()).to.contain("entry A");
    expect(entries.at(0).text()).to.contain("author A");
    expect(entries.at(1).text()).to.contain("entry B");
    expect(entries.at(1).text()).to.contain("author B1, author B2");

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );
  });

  it("renders a link to view each entry", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        opdsFeedUrl="opdsFeedUrl"
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const entriesContainer = wrapper.find(".custom-list-entries");

    expect(entriesContainer.length).to.equal(1);

    const droppable = entriesContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const entries = droppable.find(Draggable);

    expect(entries.length).to.equal(2);

    expect(entries.at(0).find("CatalogLink").text()).to.equal("View details");
    expect(entries.at(0).find("CatalogLink").prop("bookUrl")).to.equal(
      "/some/urlA"
    );

    expect(entries.at(1).find("CatalogLink").text()).to.equal("View details");
    expect(entries.at(1).find("CatalogLink").prop("bookUrl")).to.equal(
      "/some/urlB"
    );
  });

  it("renders an SVG icon for each entry", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const entriesContainer = wrapper.find(".custom-list-entries");
    const audioSVGs = entriesContainer.find(AudioHeadphoneIcon);
    const bookSVGs = entriesContainer.find(BookIcon);

    expect(audioSVGs.length).to.equal(1);
    expect(bookSVGs.length).to.equal(1);
  });

  it("doesn't include search results that are already in the entries list when autoUpdate is false", () => {
    const entriesData = [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
    ];

    const wrapper = mount(
      <CustomListEntriesEditor
        autoUpdate={false}
        searchResults={searchResultsData}
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");

    expect(resultsContainer.length).to.equal(1);

    const droppable = resultsContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const results = droppable.find(Draggable);

    expect(results.length).to.equal(2);

    expect(results.at(0).text()).to.contain("result 2");
    expect(results.at(0).text()).to.contain("author 2a, author 2b");
    expect(results.at(1).text()).to.contain("result 3");
    expect(results.at(1).text()).to.contain("author 3");
  });

  it("shows all search results, even ones that are in the entries list, when autoUpdate is true", () => {
    const entriesData = [
      {
        id: "1",
        title: "result 1",
        authors: ["author 1"],
        language: "eng",
        raw: {
          $: {
            "schema:additionalType": {
              value: "http://bib.schema.org/Audiobook",
            },
          },
        },
      },
    ];

    const wrapper = mount(
      <CustomListEntriesEditor
        autoUpdate={true}
        searchResults={searchResultsData}
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const resultsContainer = wrapper.find(".custom-list-search-results");

    expect(resultsContainer.length).to.equal(1);

    const droppable = resultsContainer.find(Droppable);

    expect(droppable.length).to.equal(1);

    const results = droppable.find(Draggable);

    expect(results.length).to.equal(3);
    expect(results.at(0).text()).to.contain("result 1");
    expect(results.at(0).text()).to.contain("author 1");
    expect(results.at(1).text()).to.contain("result 2");
    expect(results.at(1).text()).to.contain("author 2a, author 2b");
    expect(results.at(2).text()).to.contain("result 3");
    expect(results.at(2).text()).to.contain("author 3");
  });

  // FIXME: react-beautiful-dnd does not work well in jsdom, so the following drag-and-drop tests
  // reach into the render tree to find the DragDropContext, and directly call the onDragStart and
  // onDragEnd props. A better way would be to simulate the mouse/keyboard events that occur during
  // a drag-and-drop operation, without knowing anything about the implementation. This would be
  // possible if the tests ran in real browsers, e.g. by using Karma.

  it("prevents dragging within search results", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    // Simulate starting a drag from search results.

    const dragDropContext = wrapper.find(DragDropContext);
    const onDragStart = dragDropContext.prop("onDragStart");

    onDragStart({
      draggableId: "1",
      source: {
        droppableId: "search-results",
      },
    });

    wrapper.update();

    const resultsContainer = wrapper.find(".custom-list-search-results");
    const resultsDroppable = resultsContainer.find(Droppable);

    expect(resultsDroppable.prop("isDropDisabled")).to.equal(true);
  });

  it("prevents dragging within list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    // Simulate starting a drag from list entries.

    const dragDropContext = wrapper.find(DragDropContext);
    const onDragStart = dragDropContext.prop("onDragStart");

    onDragStart({
      draggableId: "A",
      source: {
        droppableId: "custom-list-entries",
      },
    });

    wrapper.update();

    const entriesContainer = wrapper.find(".custom-list-entries");
    const entriesDroppable = entriesContainer.find(Droppable);

    expect(entriesDroppable.prop("isDropDisabled")).to.equal(true);
  });

  it("calls addEntry when a book is dragged from search results to list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        addEntry={addEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    // Simulate starting a drag from search results.

    const dragDropContext = wrapper.find(DragDropContext);
    const onDragStart = dragDropContext.prop("onDragStart");

    onDragStart({
      draggableId: "1",
      source: {
        droppableId: "search-results",
      },
    });

    wrapper.update();

    const entriesContainer = wrapper.find(".custom-list-entries");
    const entriesDroppable = entriesContainer.find(Droppable);

    expect(entriesDroppable.prop("isDropDisabled")).to.equal(false);

    // Simulate dropping on the entries.

    const onDragEnd = dragDropContext.prop("onDragEnd");

    onDragEnd({
      draggableId: "1",
      source: {
        droppableId: "search-results",
      },
      destination: {
        droppableId: "custom-list-entries",
      },
    });

    wrapper.update();

    expect(addEntry.callCount).to.equal(1);
    expect(addEntry.args[0]).to.deep.equal(["1"]);
  });

  it("shows a message in place of search results when dragging from list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    // Simulate starting a drag from list entries.

    const dragDropContext = wrapper.find(DragDropContext);
    const onDragStart = dragDropContext.prop("onDragStart");

    onDragStart({
      draggableId: "A",
      source: {
        droppableId: "custom-list-entries",
      },
    });

    wrapper.update();

    let resultsContainer = wrapper.find(".custom-list-search-results");
    let resultsDroppable = resultsContainer.find(Droppable);

    expect(resultsDroppable.prop("isDropDisabled")).to.equal(false);

    let message = resultsDroppable.find("p");

    expect(message.length).to.equal(1);
    expect(message.text()).to.contain("here to remove");

    // If the drop occurs anywhere on the page, the message goes away.
    // Simulate dropping outside a droppable (no destination).

    const onDragEnd = dragDropContext.prop("onDragEnd");

    onDragEnd({
      draggableId: "A",
      source: {
        droppableId: "custom-list-entries",
      },
    });

    wrapper.update();

    resultsContainer = wrapper.find(".custom-list-search-results");
    resultsDroppable = resultsContainer.find(Droppable);

    expect(resultsDroppable.prop("isDropDisabled")).to.equal(true);

    message = resultsDroppable.find("p");

    expect(message.length).to.equal(0);
  });

  it("calls deleteEntry when a book is dragged from list entries to search results", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        deleteEntry={deleteEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    // Simulate starting a drag from list entries.

    const dragDropContext = wrapper.find(DragDropContext);
    const onDragStart = dragDropContext.prop("onDragStart");

    onDragStart({
      draggableId: "A",
      source: {
        droppableId: "custom-list-entries",
      },
    });

    wrapper.update();

    const resultsContainer = wrapper.find(".custom-list-search-results");
    const resultsDroppable = resultsContainer.find(Droppable);

    expect(resultsDroppable.prop("isDropDisabled")).to.equal(false);

    // Simulate dropping on the search results.

    const onDragEnd = dragDropContext.prop("onDragEnd");

    onDragEnd({
      draggableId: "A",
      source: {
        droppableId: "custom-list-entries",
      },
      destination: {
        droppableId: "search-results",
      },
    });

    wrapper.update();

    expect(deleteEntry.callCount).to.equal(1);
    expect(deleteEntry.args[0]).to.deep.equal(["A"]);
  });

  it("calls addEntry when the Add to List button is clicked on a search result", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        addEntry={addEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const addButton = wrapper
      .find(".custom-list-search-results .links")
      .find(Button);

    addButton.at(0).simulate("click");

    expect(addEntry.callCount).to.equal(1);
    expect(addEntry.args[0]).to.deep.equal(["1"]);
  });

  it("hides the Add to List buttons when autoUpdate is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        autoUpdate={true}
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        addEntry={addEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    const addButton = wrapper
      .find(".custom-list-search-results .links")
      .find(Button);

    expect(addButton.length).to.equal(0);
  });

  it("calls deleteEntry when the Remove from List button is clicked on a list entry", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        deleteEntry={deleteEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const deleteButton = wrapper
      .find(".custom-list-entries .links")
      .find(Button);

    deleteButton.at(0).simulate("click");

    expect(deleteEntry.callCount).to.equal(1);
    expect(deleteEntry.args[0]).to.deep.equal(["A"]);
  });

  it("does not render Remove from List buttons on a list entries when isOwner is false", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={false}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        deleteEntry={deleteEntry}
      />,
      { context: fullContext, childContextTypes }
    );

    const deleteButtons = wrapper.find(".custom-list-entries .links button");

    expect(deleteButtons.length).to.equal(0);
  });

  it("does not render the Add All to List button when there are no search results", () => {
    const wrapper = shallow(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".add-all-button");

    expect(button.length).to.equal(0);
  });

  it("does not render the Add All to List button when autoUpdate is true", () => {
    const wrapper = shallow(
      <CustomListEntriesEditor
        autoUpdate={true}
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".add-all-button");

    expect(button.length).to.equal(0);
  });

  it("does not render the Add All to List button when isOwner is false", () => {
    const wrapper = shallow(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={false}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".add-all-button");

    expect(button.length).to.equal(0);
  });

  it("calls addAllEntries when the Add All to List button is clicked", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        addAllEntries={addAllEntries}
      />,
      { context: fullContext, childContextTypes }
    );

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const button = wrapper.find(".add-all-button").at(0);

    button.simulate("click");

    expect(addAllEntries.callCount).to.equal(1);
  });

  it("does not render the Delete all button when there are no entries", () => {
    const wrapper = shallow(
      <CustomListEntriesEditor
        entries={[]}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".delete-all-button");

    expect(button.length).to.equal(0);
  });

  it("does not render the Delete all button when isOwner is false", () => {
    const wrapper = shallow(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={false}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".delete-all-button");

    expect(button.length).to.equal(0);
  });

  it("calls deleteAllEntries when the Delete all button is clicked", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
        deleteAllEntries={deleteAllEntries}
      />,
      { context: fullContext, childContextTypes }
    );

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    const button = wrapper.find(".delete-all-button").at(0);

    button.simulate("click");

    expect(deleteAllEntries.callCount).to.equal(1);
  });

  it("hides the Load More button in search results when loadMoreSearchResults is null", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={null}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(
      ".custom-list-search-results .load-more-button"
    );

    expect(button.length).to.equal(0);
  });

  it("hides the Load More button in search results when isFetchingSearchResults is true", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={true}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(
      ".custom-list-search-results .load-more-button"
    );

    expect(button.length).to.equal(0);
  });

  it("hides Load More button in list entries when loadMoreEntries is null", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={null}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".custom-list-entries .load-more-button");

    expect(button.length).to.equal(0);
  });

  it("disables the Load More button when loading more search results", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    let button = wrapper
      .find(".custom-list-search-results .load-more-button")
      .hostNodes();

    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).not.to.be.true;

    wrapper.setProps({ isFetchingMoreSearchResults: true });

    button = wrapper
      .find(".custom-list-search-results .load-more-button")
      .hostNodes();

    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).to.equal(true);
  });

  it("disables the Load More button when loading more list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    let button = wrapper
      .find(".custom-list-entries .load-more-button")
      .hostNodes();

    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).not.to.be.true;

    wrapper.setProps({ isFetchingMoreCustomListEntries: true });

    button = wrapper.find(".custom-list-entries .load-more-button").hostNodes();

    expect(button.length).to.equal(1);
    expect(button.prop("disabled")).to.equal(true);
  });

  it("calls loadMoreSearchResults when the Load More button is clicked in search results", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper
      .find(".custom-list-search-results .load-more-button")
      .at(0);

    button.simulate("click");

    expect(loadMoreSearchResults.callCount).to.equal(1);
  });

  it("calls loadMoreEntries when the Load More button is clicked in list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
      />,
      { context: fullContext, childContextTypes }
    );

    const button = wrapper.find(".custom-list-entries .load-more-button").at(0);

    button.simulate("click");

    expect(loadMoreEntries.callCount).to.equal(1);
  });

  it("should properly display the count of list entries", () => {
    const wrapper = mount(
      <CustomListEntriesEditor
        entries={entriesData}
        isOwner={true}
        searchResults={searchResultsData}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingSearchResults={false}
        isFetchingMoreSearchResults={false}
        isFetchingMoreCustomListEntries={false}
        entryCount={2}
      />,
      { context: fullContext, childContextTypes }
    );

    const display = wrapper.find(".custom-list-entries h4");

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 2 books"
    );

    wrapper.setProps({
      entries: entriesData.slice(0, 1),
      entryCount: 1,
    });

    expect(display.text()).to.equal("List Entries: Displaying 1 - 1 of 1 book");

    wrapper.setProps({
      entries: [],
      entryCount: 0,
    });

    expect(display.text()).to.equal("List Entries: No books in this list");

    wrapper.setProps({
      entryCount: 12,
    });

    expect(display.text()).to.equal(
      "List Entries: Displaying 0 - 0 of 12 books"
    );

    wrapper.setProps({
      entries: entriesData,
    });

    expect(display.text()).to.equal(
      "List Entries: Displaying 1 - 2 of 12 books"
    );
  });
});
