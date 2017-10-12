import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { CustomLists } from "../CustomLists";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import EditableRadio from "../EditableRadio";
import CustomListEditor from "../CustomListEditor";

describe("CustomLists", () => {
  let wrapper;
  let fetchCustomLists;
  let editCustomList;
  let search;

  let lists = [
    { id: 1, name: "a list", entries: [] },
    { id: 2, name: "z list", entries: [] }
  ];

  let searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };

  beforeEach(() => {
    fetchCustomLists = stub();
    editCustomList = stub().returns(new Promise<void>(resolve => resolve()));
    search = stub();

    wrapper = shallow(
      <CustomLists
        csrfToken="token"
        library="library"
        lists={lists}
        searchResults={searchResults}
        isFetching={false}
        fetchCustomLists={fetchCustomLists}
        editCustomList={editCustomList}
        search={search}
        />
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

  it("renders create link", () => {
    let create = wrapper.find(".create-button");
    expect(create.length).to.equal(1);
    expect(create.props().to).to.equal("/admin/web/lists/library/create");
  });

  it("renders lists", () => {
    let lists = wrapper.find("li");
    expect(lists.length).to.equal(2);
    let listALink = lists.at(0).childAt(0);
    let listZLink = lists.at(1).childAt(0);
    expect(listALink.props().children).to.equal("a list");
    expect(listZLink.props().children).to.equal("z list");
    expect(listALink.props().to).to.equal("/admin/web/lists/library/edit/1");
    expect(listZLink.props().to).to.equal("/admin/web/lists/library/edit/2");
  });

  it("sorts lists", () => {
    wrapper = mount(
      <CustomLists
        csrfToken="token"
        library="library"
        lists={lists}
        searchResults={searchResults}
        isFetching={false}
        fetchCustomLists={fetchCustomLists}
        editCustomList={editCustomList}
        search={search}
        />
    );
    let radioButtons = wrapper.find(EditableRadio);
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

  it("renders create form", async () => {
    let editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "create" });
    editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().csrfToken).to.equal("token");
    expect(editor.props().library).to.equal("library");
    expect(editor.props().search).to.equal(search);
    expect(editor.props().searchResults).to.equal(searchResults);
    expect(editor.props().editedIdentifier).to.be.undefined;

    expect(fetchCustomLists.callCount).to.equal(1);
    let editCustomListProp = editor.props().editCustomList;
    await editCustomListProp();
    expect(editCustomList.callCount).to.equal(1);
    expect(editCustomList.args[0][0]).to.equal("library");
    expect(fetchCustomLists.callCount).to.equal(2);
    expect(fetchCustomLists.args[1][0]).to.equal("library");

    wrapper.setProps({ editedIdentifier: "5" });
    editor = wrapper.find(CustomListEditor);
    expect(editor.props().editedIdentifier).to.equal("5");
  });

  it("renders edit form", () => {
    let editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(0);

    wrapper.setProps({ editOrCreate: "edit", identifier: "2" });
    editor = wrapper.find(CustomListEditor);
    expect(editor.length).to.equal(1);
    expect(editor.props().list).to.deep.equal(lists[1]);
    expect(editor.props().csrfToken).to.equal("token");
    expect(editor.props().library).to.equal("library");
    expect(editor.props().search).to.equal(search);
    expect(editor.props().searchResults).to.equal(searchResults);
  });
});