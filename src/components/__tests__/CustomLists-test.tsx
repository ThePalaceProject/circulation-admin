import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { CustomLists } from "../CustomLists";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import EditableInput from "../EditableInput";
import CustomListEditor from "../CustomListEditor";
import Admin from "../../models/Admin";
import { LaneData } from "../../interfaces";

describe("CustomLists", () => {
  let wrapper;
  let fetchCustomLists;
  let fetchCustomListDetails;
  let deleteCustomList;
  let openCustomListEditor;
  let saveCustomListEditor;
  let executeCustomListEditorSearch;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let fetchCollections;
  let fetchLibraries;
  let fetchLanes;
  let fetchLanguages;

  const customListEditorProperties = {
    name: "",
    collections: [],
  };

  const customListEditorEntries = {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  };

  const customListEditorSearchParams = {
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

  const listsData = [
    { id: 1, name: "a list", entry_count: 0, collections: [] },
    {
      id: 2,
      name: "z list",
      entry_count: 1,
      collections: [{ id: 3, name: "collection 3", protocol: "protocol" }],
    },
  ];

  const entry = { pwid: "1", title: "title", authors: [] };

  const searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: [],
    nextPageUrl: "http://next.page",
  };

  const collections = [
    {
      id: 1,
      name: "collection 1",
      protocol: "protocol",
      libraries: [{ short_name: "other library" }],
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

  const libraries = [
    {
      short_name: "library",
      settings: {
        enabled_entry_points: ["Book", "Audio"],
      },
    },
    {
      short_name: "another library",
      settings: {
        enabled_entry_points: ["Audio"],
      },
    },
  ];

  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const lane1: LaneData = {
    id: 1,
    display_name: "lane 1",
    visible: false,
    count: 1,
    sublanes: [],
    custom_list_ids: [2],
    inherit_parent_restrictions: false,
  };
  const lane2: LaneData = {
    id: 2,
    display_name: "lane 2",
    visible: false,
    count: 1,
    sublanes: [],
    custom_list_ids: [2],
    inherit_parent_restrictions: false,
  };
  const lane3: LaneData = {
    id: 3,
    display_name: "lane 2",
    visible: false,
    count: 1,
    sublanes: [],
    custom_list_ids: [],
    inherit_parent_restrictions: false,
  };
  const allLanes = [lane1, lane2, lane3];
  const lanesToDelete = [lane1, lane2];

  const libraryManager = new Admin([{ role: "manager", library: "library" }]);
  const librarian = new Admin([{ role: "librarian", library: "library" }]);

  describe("on mount", () => {
    beforeEach(() => {
      fetchCustomLists = stub();
      openCustomListEditor = stub();
      fetchCustomListDetails = stub();
      saveCustomListEditor = stub().returns(Promise.resolve());
      deleteCustomList = stub().returns(Promise.resolve());
      executeCustomListEditorSearch = stub();
      loadMoreSearchResults = stub();
      loadMoreEntries = stub();
      fetchCollections = stub();
      fetchLibraries = stub();
      fetchLanes = stub().returns(Promise.resolve());
      fetchLanguages = stub();

      wrapper = mount(
        <CustomLists
          customListEditorProperties={customListEditorProperties}
          customListEditorEntries={customListEditorEntries}
          customListEditorSearchParams={customListEditorSearchParams}
          csrfToken="token"
          library="library"
          lists={listsData}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchLanguages={fetchLanguages}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          executeCustomListEditorSearch={executeCustomListEditorSearch}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          libraries={libraries}
          languages={languages}
        />,
        { context: { admin: libraryManager } }
      );
    });

    it("fetches libraries and languages", () => {
      expect(fetchLibraries.callCount).to.equal(1);
      expect(fetchLanguages.callCount).to.equal(1);
    });

    it("renders error message", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      wrapper.setProps({
        fetchError: { status: 500, response: "Error", url: "url" },
      });
      error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(1);
    });

    it("renders loading message", () => {
      let loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(0);

      wrapper.setProps({ isFetching: true });
      loading = wrapper.find(LoadingIndicator);
      expect(loading.length).to.equal(1);
    });

    it("navigates to create or edit page on initial load", () => {
      // Set window.location.href to be writable, jsdom doesn't normally allow changing it but browsers do.
      // Start on the lists page, without edit or create.
      Object.defineProperty(window.location, "href", {
        writable: true,
        value: "/admin/web/lists/library",
      });

      wrapper = mount(
        <CustomLists
          csrfToken="token"
          library="library"
          lists={undefined}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: libraryManager } }
      );
      wrapper.setProps({ lists: [] });
      expect(window.location.href).to.contain("create");

      wrapper = mount(
        <CustomLists
          csrfToken="token"
          library="library"
          lists={undefined}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: libraryManager } }
      );
      wrapper.setProps({ lists: listsData });
      expect(window.location.href).to.contain("edit");
      expect(window.location.href).to.contain("1");
    });

    it("sorts lists", () => {
      wrapper = mount(
        <CustomLists
          csrfToken="token"
          library="library"
          lists={listsData}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: libraryManager } }
      );
      let radioButtons = wrapper.find(EditableInput);
      let ascendingButton = radioButtons.at(0);
      let descendingButton = radioButtons.at(1);
      expect(ascendingButton.prop("checked")).to.equal(true);
      expect(descendingButton.prop("checked")).to.equal(false);

      descendingButton.find("input").simulate("change");
      radioButtons = wrapper.find(EditableInput);
      ascendingButton = radioButtons.at(0);
      descendingButton = radioButtons.at(1);

      expect(ascendingButton.prop("checked")).to.equal(false);
      expect(descendingButton.prop("checked")).to.equal(true);
      let sortedLists = wrapper.find("li");
      expect(sortedLists.length).to.equal(2);
      let firstLink = sortedLists.at(0).childAt(0);
      let secondLink = sortedLists.at(1).childAt(0);
      expect(firstLink.text()).to.contain("z list");
      expect(secondLink.text()).to.contain("a list");

      descendingButton.find("input").simulate("change");
      radioButtons = wrapper.find(EditableInput);
      ascendingButton = radioButtons.at(0);
      descendingButton = radioButtons.at(1);

      expect(ascendingButton.prop("checked")).to.equal(true);
      expect(descendingButton.prop("checked")).to.equal(false);
      sortedLists = wrapper.find("li");
      expect(sortedLists.length).to.equal(2);
      firstLink = sortedLists.at(0).childAt(0);
      secondLink = sortedLists.at(1).childAt(0);
      expect(firstLink.text()).to.contain("a list");
      expect(secondLink.text()).to.contain("z list");
    });

    it("renders edit link but does not render delete button for librarian", () => {
      wrapper = mount(
        <CustomLists
          csrfToken="token"
          library="library"
          lists={listsData}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: librarian } }
      );
      const lists = wrapper.find("li");
      expect(lists.length).to.equal(2);

      const listAButtons = lists.at(0).find(".custom-list-buttons");
      const listAEditLink = listAButtons.find("Link");
      const listZButtons = lists.at(1).find(".custom-list-buttons");
      const listZEditLink = listZButtons.find("Link");
      expect(listAEditLink.length).to.equal(1);
      expect(listAEditLink.text()).to.include("Edit");
      expect(listAEditLink.prop("to")).to.equal(
        "/admin/web/lists/library/edit/1"
      );
      expect(listZEditLink.length).to.equal(1);
      expect(listZEditLink.text()).to.include("Edit");
      expect(listZEditLink.prop("to")).to.equal(
        "/admin/web/lists/library/edit/2"
      );

      const listADeleteButton = listAButtons.find("button");
      const listZDeleteButton = listZButtons.find("button");
      expect(listADeleteButton.length).to.equal(0);
      expect(listZDeleteButton.length).to.equal(0);
    });

    it("fetches lanes to be deleted", async () => {
      let deletedLanes = await (wrapper.instance() as CustomLists).getDeletedLanes(
        listsData[1].id
      );
      // There are no lanes so fetch them.
      expect(fetchLanes.callCount).to.equal(1);

      // But now manually setting the lanes so the fetchLanes
      // call count should still remain at 1.
      wrapper.setProps({ lanes: allLanes });

      deletedLanes = await (wrapper.instance() as CustomLists).getDeletedLanes(
        listsData[1].id
      );

      expect(fetchLanes.callCount).to.equal(1);
      expect(deletedLanes.length).to.equal(2);
      expect(deletedLanes[0]).to.equal(lane1);
      expect(deletedLanes[1]).to.equal(lane2);
    });

    it("outputs a list of lanes that will be deleted when a list is deleted", () => {
      const prompt = (wrapper.instance() as CustomLists).deletedLaneNames(
        lanesToDelete
      );
      expect(prompt).to.equal(
        "Deleting this list will delete the following lanes:\n" +
          "\nLane name: lane 1\nLane name: lane 2"
      );
    });

    it("saves a list", async () => {
      (wrapper.instance() as CustomLists).saveCustomListEditor();
      expect(saveCustomListEditor.callCount).to.equal(1);
    });

    it("renders create form", async () => {
      let editor = wrapper.find(CustomListEditor);
      expect(editor.length).to.equal(0);

      wrapper.setProps({ editOrCreate: "create" });
      editor = wrapper.find(CustomListEditor);
      expect(editor.length).to.equal(1);
      expect(editor.props().library).to.eql(libraries[0]);
      expect(editor.props().list).to.be.undefined;
      expect(editor.props().search).to.equal(executeCustomListEditorSearch);
      expect(editor.props().loadMoreSearchResults).to.equal(
        loadMoreSearchResults
      );
      expect(editor.props().searchResults).to.equal(searchResults);
      expect(editor.props().isFetchingMoreSearchResults).to.equal(false);
      expect(editor.props().collections).to.deep.equal([
        collections[1],
        collections[2],
      ]);
      expect(editor.props().languages).to.eql(languages);

      expect(fetchCustomLists.callCount).to.equal(1);
      const save = editor.props().save;
      await save();
      expect(saveCustomListEditor.callCount).to.equal(1);
      expect(fetchCustomLists.callCount).to.equal(2);
    });

    it("renders edit form", () => {
      let editor = wrapper.find(CustomListEditor);
      expect(editor.length).to.equal(0);

      const listDetails = Object.assign({}, listsData[1], { entries: [entry] });
      wrapper.setProps({ editOrCreate: "edit", identifier: "2", listDetails });
      editor = wrapper.find(CustomListEditor);
      expect(editor.length).to.equal(1);
      expect(editor.props().library).to.eql(libraries[0]);
      expect(editor.props().search).to.equal(executeCustomListEditorSearch);
      expect(editor.props().loadMoreSearchResults).to.equal(
        loadMoreSearchResults
      );
      expect(editor.props().searchResults).to.equal(searchResults);
      expect(editor.props().isFetchingMoreSearchResults).to.equal(false);
      expect(editor.props().collections).to.deep.equal([
        collections[1],
        collections[2],
      ]);
      expect(editor.props().languages).to.eql(languages);

      expect(fetchCustomListDetails.callCount).to.equal(1);

      // When the component switches to a different list, it fetches the new
      // list details.
      const newListDetails = Object.assign({}, listsData[0], { entries: [] });
      wrapper.setProps({ identifier: "1" });
      expect(fetchCustomListDetails.callCount).to.equal(2);
    });

    it("gets the correct entry points list from the right library", () => {
      const entryPoints = wrapper.instance().getEnabledEntryPoints(libraries);

      expect(entryPoints.length).to.equal(2);
      expect(entryPoints).to.eql(["Book", "Audio"]);
    });

    it("gets the correct entry points list from the second available library", () => {
      wrapper = mount(
        <CustomLists
          csrfToken="token"
          library="another library"
          lists={listsData}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: librarian } }
      );

      const entryPoints = wrapper.instance().getEnabledEntryPoints(libraries);

      expect(entryPoints.length).to.equal(1);
      expect(entryPoints).to.eql(["Audio"]);
    });
  });

  // These tests are for mocking the confirm function in the window object.
  // It reliably works when shallow mounting a component but not when doing a
  // full mount. Seems to be a problem with Node v10+.
  describe("on shallow mount", () => {
    let confirmStub;
    let listDataSort;
    let deleteCustomListFn;

    beforeEach(() => {
      confirmStub = stub(window, "confirm");
      fetchCustomLists = stub();
      openCustomListEditor = stub();
      fetchCustomListDetails = stub();
      saveCustomListEditor = stub().returns(Promise.resolve());
      deleteCustomList = stub().returns(Promise.resolve());
      executeCustomListEditorSearch = stub();
      loadMoreSearchResults = stub();
      loadMoreEntries = stub();
      fetchCollections = stub();
      fetchLibraries = stub();
      fetchLanes = stub().returns(Promise.resolve());

      wrapper = shallow(
        <CustomLists
          csrfToken="token"
          library="another library"
          lists={listsData}
          searchResults={searchResults}
          collections={collections}
          isFetching={false}
          isFetchingMoreSearchResults={false}
          isFetchingMoreCustomListEntries={false}
          fetchCustomLists={fetchCustomLists}
          fetchCustomListDetails={fetchCustomListDetails}
          saveCustomListEditor={saveCustomListEditor}
          deleteCustomList={deleteCustomList}
          openCustomListEditor={openCustomListEditor}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          fetchCollections={fetchCollections}
          fetchLibraries={fetchLibraries}
          fetchLanes={fetchLanes}
          fetchLanguages={fetchLanguages}
          languages={languages}
        />,
        { context: { admin: librarian } }
      );

      deleteCustomListFn = (wrapper.instance() as CustomLists).deleteCustomList;
      listDataSort = (wrapper.instance() as CustomLists).sortedLists(listsData);
    });

    afterEach(() => {
      confirmStub.restore();
    });

    // Ideally, the test would click on the button that calls the
    // `deleteCustomList` function which in turn calls the `deleteCustomList`
    // prop. Instead, call the instance's `deleteCustomList` function directly,
    // and check if the prop was called and with what arguments.
    it("deletes a list", async () => {
      confirmStub.returns(false);
      const getDeletedLanes = stub(
        wrapper.instance() as CustomLists,
        "getDeletedLanes"
      ).returns(Promise.resolve());

      // The instance's `deleteCustomList` function needs a CustomListData
      // list which is one sorted object from full list of lists. The first
      // list corresponds to the "button".
      await deleteCustomListFn(listDataSort[0]);
      expect(deleteCustomList.callCount).to.equal(0);

      confirmStub.returns(true);

      await deleteCustomListFn(listDataSort[0]);
      expect(deleteCustomList.callCount).to.equal(1);
      expect(deleteCustomList.args[0][0]).to.equal("1");

      getDeletedLanes.restore();
    });

    it("deletes a list and warns of lanes that will be deleted", async () => {
      wrapper.setProps({ lanes: allLanes });

      confirmStub.returns(true);

      await deleteCustomListFn(listDataSort[0]);
      // prettier-ignore
      /* eslint-disable */
      expect(confirmStub.args[0][0]).to.equal("Delete list \"a list\"? ");

      // Continuining from the previous test, this second list corresponds
      // to the second "button" that is being clicked.
      await deleteCustomListFn(listDataSort[1]);
      // prettier-ignore
      expect(confirmStub.args[1][0]).to.equal("Delete list \"z list\"? " +
        "Deleting this list will delete the following lanes:\n" +
          "\nLane name: lane 1\nLane name: lane 2"
      );
    });
  });
});
