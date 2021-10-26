import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListEditor from "../CustomListEditor";
import CustomListEditorHeader from "../CustomListEditorHeader";
import CustomListEditorBody from "../CustomListEditorBody";
import { Button } from "library-simplified-reusable-components";

describe.only("CustomListEditor", () => {
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
  const listCollections = [
    { id: 2, name: "collection 2", protocol: "protocol" },
  ];
  let editCustomList;
  let search;
  let loadMoreSearchResults;
  let loadMoreEntries;

  beforeEach(() => {
    editCustomList = stub().returns(
      new Promise<void>((resolve) => resolve())
    );
    search = stub();
    loadMoreSearchResults = stub();
    loadMoreEntries = stub();
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
      />
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

  it("it switches to the edit form after a new form is saved", () => {
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

  it("cancels changes", () => {
    console.log(wrapper.debug());
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

    console.log(wrapper.debug());
    const cancelChangesButton = wrapper
      .find(".save-or-cancel-list")
      .find(Button)
      .at(1);
    expect(cancelChangesButton.props().disabled).to.equal(false);
    cancelChangesButton.simulate("click");

    listTitle = wrapper.find("h3").at(0);
    expect(listTitle.text()).to.include("original list title");
  });
});
