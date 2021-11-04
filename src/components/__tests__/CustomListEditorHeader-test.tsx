import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import * as Enzyme from "enzyme";

import CustomListEditorHeader from "../CustomListEditorHeader";
import TextWithEditMode from "../TextWithEditMode";

describe("CustomListEditorHeader", () => {
  let wrapper;
  let setDraftTitle;
  let setDraftEntries;
  let saveFormData;
  let list;
  let setDeletedListEntries;
  let setAddedListEntries;

  beforeEach(() => {
    setDraftTitle = stub();
    setDraftEntries = stub();
    setDeletedListEntries = stub();
    setAddedListEntries = stub();

    saveFormData = stub();
    list = {
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
    wrapper = Enzyme.mount(
      <CustomListEditorHeader
        draftTitle={list.title}
        list={list}
        listId={list.id}
        listEntries={list.books}
        hasListInfoChanged={false}
        setDraftTitle={setDraftTitle}
        setDraftEntries={setDraftEntries}
        setDeletedListEntries={setDeletedListEntries}
        setAddedListEntries={setAddedListEntries}
        saveFormData={saveFormData}
      />
    );
  });

  it("shows list title", () => {
    const title = wrapper.find(TextWithEditMode);
    expect(title.length).to.equal(1);
    expect(title.props().text).to.equal("original list title");
    expect(title.props().placeholder).to.equal("list title");
    expect(title.props().disableIfBlank).to.be.true;
  });

  it("shows list id", () => {
    const listId = wrapper.find(".custom-list-editor-header h4");
    expect(listId.length).to.equal(1);
    expect(listId.text()).to.contain("1");
  });

  it("disables save button if title or entries is blank", () => {
    let saveListButton = wrapper.find(".save-or-cancel-list").children().at(0);
    expect(saveListButton.props().disabled).to.equal(true);
    wrapper.setProps({ hasListInfoChanged: true });
    saveListButton = wrapper.find(".save-or-cancel-list").children().at(0);
    expect(saveListButton.props().disabled).to.equal(false);
    wrapper.setProps({
      draftTitle: "",
    });
    saveListButton = wrapper.find(".save-or-cancel-list").children().at(0);
    expect(saveListButton.props().disabled).to.equal(true);
    wrapper.setProps({
      draftTitle: "original list title",
      listEntries: [],
    });
    saveListButton = wrapper.find(".save-or-cancel-list").children().at(0);
    expect(saveListButton.props().disabled).to.equal(true);
  });

  it("disables cancel button, unless there are changes", () => {
    let cancelChangesButton = wrapper
      .find(".save-or-cancel-list")
      .children()
      .at(1);
    expect(cancelChangesButton.props().disabled).to.equal(true);
    wrapper.setProps({ hasListInfoChanged: true });
    cancelChangesButton = wrapper.find(".save-or-cancel-list").children().at(1);
    expect(cancelChangesButton.props().disabled).to.equal(false);
  });
});
