import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { CustomLists } from "../CustomLists";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import EditableInput from "../EditableInput";
import CustomListEditor from "../CustomListEditor";
import { Link } from "react-router";
import Admin from "../../models/Admin";

describe("CustomLists", () => {
  let wrapper;
  let fetchCustomLists;
  let fetchCustomListDetails;
  let editCustomList;
  let deleteCustomList;
  let search;
  let loadMoreSearchResults;
  let loadMoreEntries;
  let fetchCollections;
  let fetchLibraries;

  let listsData = [
    { id: 1, name: "a list", entry_count: 0, collections: [] },
    { id: 2, name: "z list", entry_count: 1,
      collections: [{id: 3, name: "collection 3", protocol: "protocol" }] }
  ];

  let entry = { pwid: "1", title: "title", authors: [] };

  let searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };

  let collections = [
    { id: 1, name: "collection 1", protocol: "protocol", libraries: [{ short_name: "other library" }] },
    { id: 2, name: "collection 2", protocol: "protocol", libraries: [{ short_name: "library" }] },
    { id: 3, name: "collection 3", protocol: "protocol", libraries: [{ short_name: "library" }] }
  ];

  let libraries = [
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

  const libraryManager = new Admin([{ "role": "manager", "library": "library" }]);
  const librarian = new Admin([{ "role": "librarian", "library": "library" }]);

  beforeEach(() => {
    fetchCustomLists = stub();
    fetchCustomListDetails = stub();
    editCustomList = stub().returns(new Promise<void>(resolve => resolve()));
    deleteCustomList = stub().returns(new Promise<void>(resolve => resolve()));
    search = stub();
    loadMoreSearchResults = stub();
    loadMoreEntries = stub();
    fetchCollections = stub();
    fetchLibraries = stub();

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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
        />,
      { context: { admin: libraryManager }}
    );
  });

  it("renders error message", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    wrapper.setProps({ fetchError: { status: 500, response: "Error", url: "url" } });
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
    Object.defineProperty(window.location, "href", { writable: true, value: "/admin/web/lists/library" });

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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
        />,
      { context: { admin: libraryManager }}
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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
        />,
      { context: { admin: libraryManager }}
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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
        />,
      { context: { admin: libraryManager }}
    );
    let radioButtons = wrapper.find(EditableInput);
    let ascendingButton = radioButtons.at(0);
    let descendingButton = radioButtons.at(1);
    expect(ascendingButton.prop("checked")).to.equal(true);
    expect(descendingButton.prop("checked")).to.equal(false);

    descendingButton.find("input").simulate("change");
    expect(ascendingButton.prop("checked")).to.equal(false);
    expect(descendingButton.prop("checked")).to.equal(true);
    let sortedLists = wrapper.find("li");
    expect(sortedLists.length).to.equal(2);
    let firstLink = sortedLists.at(0).childAt(0);
    let secondLink = sortedLists.at(1).childAt(0);
    expect(firstLink.text()).to.contain("z list");
    expect(secondLink.text()).to.contain("a list");

    descendingButton.find("input").simulate("change");
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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
        />,
      { context: { admin: librarian }}
    );
    let lists = wrapper.find("li");
    expect(lists.length).to.equal(2);

    let listAButtons = lists.at(0).find(".custom-list-buttons");
    let listAEditLink = listAButtons.find("Link");
    let listZButtons = lists.at(1).find(".custom-list-buttons");
    let listZEditLink = listZButtons.find("Link");
    expect(listAEditLink.length).to.equal(1);
    expect(listAEditLink.text()).to.include("Edit");
    expect(listAEditLink.prop("to")).to.equal("/admin/web/lists/library/edit/1");
    expect(listZEditLink.length).to.equal(1);
    expect(listZEditLink.text()).to.include("Edit");
    expect(listZEditLink.prop("to")).to.equal("/admin/web/lists/library/edit/2");

    let listADeleteButton = listAButtons.find("button");
    let listZDeleteButton = listZButtons.find("button");
    expect(listADeleteButton.length).to.equal(0);
    expect(listZDeleteButton.length).to.equal(0);
  });

  it("deletes a list", () => {
    let confirmStub = stub(window, "confirm").returns(false);

    let lists = wrapper.find("li");
    let deleteButton = lists.at(0).find("button");
    deleteButton.simulate("click");

    expect(deleteCustomList.callCount).to.equal(0);

    confirmStub.returns(true);
    deleteButton.simulate("click");

    expect(deleteCustomList.callCount).to.equal(1);
    expect(deleteCustomList.args[0][0]).to.equal("1");

    confirmStub.restore();
  });

  it("edits a list", () => {
    const testData = new (window as any).FormData();
    (wrapper.instance() as CustomLists).editCustomList(testData, "id");
    expect(editCustomList.callCount).to.equal(1);
    expect(editCustomList.args[0][0]).to.equal(testData);
    expect(editCustomList.args[0][1]).to.equal("id");
  });

  it("renders create form", async () => {
    let editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "create" });
    editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().list).to.be.undefined;
    expect(editor.props().search).to.equal(search);
    expect(editor.props().loadMoreSearchResults).to.equal(loadMoreSearchResults);
    expect(editor.props().searchResults).to.equal(searchResults);
    expect(editor.props().responseBody).to.be.undefined;
    expect(editor.props().isFetchingMoreSearchResults).to.equal(false);
    expect(editor.props().collections).to.deep.equal([collections[1], collections[2]]);

    expect(fetchCustomLists.callCount).to.equal(1);
    let editCustomListProp = editor.props().editCustomList;
    await editCustomListProp();
    expect(editCustomList.callCount).to.equal(1);
    expect(fetchCustomLists.callCount).to.equal(2);

    wrapper.setProps({ responseBody: "5" });
    editor = wrapper.find(CustomListEditor);
    expect(editor.props().responseBody).to.equal("5");
  });

  it("renders edit form", () => {
    let editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(0);

    let listDetails = Object.assign({}, listsData[1], { entries: [entry] });
    wrapper.setProps({ editOrCreate: "edit", identifier: "2", listDetails });
    editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().list).to.deep.equal(listDetails);
    expect(editor.props().library).to.equal("library");
    expect(editor.props().search).to.equal(search);
    expect(editor.props().loadMoreSearchResults).to.equal(loadMoreSearchResults);
    expect(editor.props().searchResults).to.equal(searchResults);
    expect(editor.props().isFetchingMoreSearchResults).to.equal(false);
    expect(editor.props().collections).to.deep.equal([collections[1], collections[2]]);

    expect(fetchCustomListDetails.callCount).to.equal(1);

    // When the component switches to a different list, it fetches the new
    // list details.
    let newListDetails = Object.assign({}, listsData[0], { entries: [] });
    wrapper.setProps({ identifier: "1", listDetails: newListDetails });
    editor = wrapper.find(CustomListEditor);
    expect(editor.props().list).to.deep.equal(newListDetails);
    expect(fetchCustomListDetails.callCount).to.equal(2);
  });

  it("gets the correct entry points list from the right library", () => {
    let entryPoints = wrapper.instance().getEnabledEntryPoints(libraries);

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
        editCustomList={editCustomList}
        deleteCustomList={deleteCustomList}
        search={search}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        fetchCollections={fetchCollections}
        fetchLibraries={fetchLibraries}
      />,
      { context: { admin: librarian }}
    );

    let entryPoints = wrapper.instance().getEnabledEntryPoints(libraries);

    expect(entryPoints.length).to.equal(1);
    expect(entryPoints).to.eql(["Audio"]);
  });
});
