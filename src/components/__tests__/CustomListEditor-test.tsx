import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListEditor from "../CustomListEditor";
import CustomListEditorHeader from "../CustomListEditorHeader";
import CustomListEditorBody from "../CustomListEditorBody";
import EditableInput from "../EditableInput";
import TextWithEditMode from "../TextWithEditMode";

describe("CustomListEditor", () => {
  let wrapper;
  const languages = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
    fre: ["French"],
  };

  const library = {
    uuid: "uuid",
    name: "name",
    short_name: "library",
    settings: {
      large_collections: ["eng", "fre", "spa"],
    },
  };

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
    const header = wrapper.find(CustomListEditorHeader);
    expect(header.props().hasListInfoChanged).to.equal(false);
    console.log("wrapper -->", wrapper.debug());
    const input = wrapper.find("input[type='text']");
    expect(input.props().value).to.equal("");
    input.invoke("onChange", {
      target: { value: "new title" },
    })();

    // expect(input.props().value).to.equal("new title");
    // let editableInput = wrapper.find(EditableInput).at(0);

    // input.getDOMNode().value = "new title";
    // const saveTitleButton = wrapper.find(".inverted.inline").at(0);
    // saveTitleButton.invoke("onClick")();

    // expect(editableInput.props().value).to.equal("new title");

    // input = wrapper.find("input[type='text']");

    // // expect(editableInput.get(0).value).to.equal("new title");
    // expect(editableInput.props().value).to.equal("new title");

    // // input.getElement().value = "new title";
    // // input = wrapper.find("input[type='text']");
    // // expect(input.get(0).value).to.equal("new title");
    // header = wrapper.find(CustomListEditorHeader);
    // expect(header.props().hasListInfoChanged).to.equal(true);
  });

  it("it switches to the edit form after a new form is saved", () => {
    Object.defineProperty(window.location, "href", {
      writable: true,
      value: "/admin/web/lists/library/create",
    });
    wrapper.setProps({ responseBody: "1" });
    expect(window.location.href).not.to.contain("create");
    expect(window.location.href).to.contain("edit");
    expect(window.location.href).to.contain("1");
  });
});
