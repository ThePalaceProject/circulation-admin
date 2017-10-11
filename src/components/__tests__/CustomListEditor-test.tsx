import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import CustomListEditor from "../CustomListEditor";
import TextWithEditMode from "../TextWithEditMode";
import CustomListEntriesEditor from "../CustomListEntriesEditor";

describe("CustomListEditor", () => {
  let wrapper;
  let editCustomList;
  let search;

  let listData = {
    id: 1,
    name: "list",
    entries: [
      { pwid: "1", title: "title 1", authors: ["author 1"] },
      { pwid: "2", title: "title 2", authors: ["author 2a", "author 2b"] }
    ]
  };

  let searchResults = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: []
  };

  beforeEach(() => {
    editCustomList = stub().returns(new Promise<void>(resolve => resolve()));
    search = stub();
    wrapper = shallow(
      <CustomListEditor
        csrfToken="token"
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        />
    );
  });

  it("shows list name", () => {
    let name = wrapper.find(TextWithEditMode);
    expect(name.length).to.equal(1);
    expect(name.props().text).to.equal("list");
    expect(name.props().placeholder).to.equal("list name");
  });

  it("shows entries editor with list entries and search results", () => {
    let entriesEditor = wrapper.find(CustomListEntriesEditor);
    expect(entriesEditor.length).to.equal(1);
    expect(entriesEditor.props().entries).to.equal(listData.entries);
    expect(entriesEditor.props().searchResults).to.equal(searchResults);
  });

  it("saves list", () => {
    wrapper = mount(
      <CustomListEditor
        csrfToken="token"
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        />
    );
    let getTextStub = stub(TextWithEditMode.prototype, "getText").returns("new list name");
    let newEntries = [
      { pwid: "pwid1" }, { pwid: "pwid2" }
    ];
    let getEntriesStub = stub(CustomListEntriesEditor.prototype, "getEntries").returns(newEntries);
    let saveButton = wrapper.find(".save-list");
    saveButton.simulate("click");

    expect(editCustomList.callCount).to.equal(1);
    let formData = editCustomList.args[0][0];
    expect(formData.get("csrf_token")).to.equal("token");
    expect(formData.get("id")).to.equal("1");
    expect(formData.get("name")).to.equal("new list name");
    expect(formData.get("entries")).to.equal(JSON.stringify(newEntries));

    getTextStub.restore();
    getEntriesStub.restore();
  });

  it("cancels changes", () => {
    let listNameReset = stub(TextWithEditMode.prototype, "reset");
    let listEntriesReset = stub(CustomListEntriesEditor.prototype, "reset");

    wrapper = mount(
      <CustomListEditor
        csrfToken="token"
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        />
    );
    let cancelButton = wrapper.find(".cancel-changes");
    cancelButton.simulate("click");

    expect(listNameReset.callCount).to.equal(1);
    expect(listEntriesReset.callCount).to.equal(1);

    listNameReset.restore();
    listEntriesReset.restore();
  });

  it("searches", () => {
    wrapper = mount(
      <CustomListEditor
        csrfToken="token"
        library="library"
        list={listData}
        searchResults={searchResults}
        editCustomList={editCustomList}
        search={search}
        />
    );
    let input = wrapper.find(".form-control") as any;
    input.get(0).value = "test";

    let searchForm = wrapper.find("form");
    searchForm.simulate("submit");

    expect(search.callCount).to.equal(1);
    expect(search.args[0][0]).to.equal("/library/search?q=test");
  });
});