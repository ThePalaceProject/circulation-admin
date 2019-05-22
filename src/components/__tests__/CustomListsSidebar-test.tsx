import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import * as Enzyme from "enzyme";

import CustomListsSidebar from "../CustomListsSidebar";
import EditableInput from "../EditableInput";
import { Link } from "react-router";
import { Button } from "library-simplified-reusable-components";

describe("CustomListsSidebar", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let lists;
  let deleteCustomList = stub();
  let changeSort = stub();

  beforeEach(() => {
    lists = [
      { id: 1, name: "First List", entry_count: 5 },
      { id: 2, name: "Second List", entry_count: 10 }
    ];
    wrapper = Enzyme.mount(
      <CustomListsSidebar
        lists={lists}
        library="library_name"
        identifier="123"
        isLibraryManager={true}
        deleteCustomList={deleteCustomList}
        changeSort={changeSort}
        sortOrder="asc"
      />
    );
  });

  it("renders a sidebar with a header and a create button", () => {
    expect(wrapper.render().hasClass("custom-lists-sidebar")).to.be.true;
    expect(wrapper.find("h2").text()).to.equal("List Manager");
    let createButton = wrapper.find(Link).at(0);
    expect(createButton.text()).to.equal("Create New List");
    expect(createButton.prop("to")).to.equal("/admin/web/lists/library_name/create");
  });

  it("renders sort buttons", () => {
    let sortButtons = wrapper.find("fieldset");
    let asc = sortButtons.find(".form-group").at(0);
    let desc = sortButtons.find(".form-group").at(1);
    expect(asc.text()).to.equal("Sort A-Z");
    expect(asc.find("input").prop("checked")).to.be.true;
    expect(desc.text()).to.equal("Sort Z-A");
    expect(desc.find("input").prop("checked")).to.be.false;

    wrapper.setProps({ sortOrder: "desc" });
    sortButtons = wrapper.find("fieldset");
    asc = sortButtons.find(".form-group").at(0);
    desc = sortButtons.find(".form-group").at(1);

    expect(desc.find("input").prop("checked")).to.be.true;
    expect(asc.find("input").prop("checked")).to.be.false;
  });

  it("renders a list of custom list info items", () => {
    let listOfLists = wrapper.find("ul");
    expect(listOfLists.length).to.equal(1);
    let firstList = listOfLists.find("li").at(0);
    let secondList = listOfLists.find("li").at(1);

    let firstListInfo = firstList.find(".custom-list-info");
    expect(firstListInfo.find("p").at(0).text()).to.equal("First List");
    expect(firstListInfo.find("p").at(1).text()).to.equal("Books in list: 5");
    expect(firstListInfo.find("p").at(2).text()).to.equal("ID-1");

    let firstListButtons = firstList.find(".custom-list-buttons");
    let firstListEdit = firstListButtons.find(Link).at(0);
    let firstListDelete = firstListButtons.find(Button).at(0);
    expect(firstListEdit.text()).to.contain("Edit");
    expect(firstListEdit.prop("to")).to.equal("/admin/web/lists/library_name/edit/1");
    expect(firstListDelete.text()).to.contain("Delete");
    firstListDelete.simulate("click");
    expect(deleteCustomList.callCount).to.equal(1);

    let secondListInfo = secondList.find(".custom-list-info");
    expect(secondListInfo.find("p").at(0).text()).to.equal("Second List");
    expect(secondListInfo.find("p").at(1).text()).to.equal("Books in list: 10");
    expect(secondListInfo.find("p").at(2).text()).to.equal("ID-2");

    let secondListButtons = secondList.find(".custom-list-buttons");
    let secondListEdit = secondListButtons.find(Link).at(0);
    let secondListDelete = secondListButtons.find(Button).at(0);
    expect(secondListEdit.text()).to.contain("Edit");
    expect(secondListEdit.prop("to")).to.equal("/admin/web/lists/library_name/edit/2");
    expect(secondListDelete.text()).to.contain("Delete");
    secondListDelete.simulate("click");
    expect(deleteCustomList.callCount).to.equal(2);
  });

  it("disables the edit button if the list is already being edited", () => {
    let firstListEdit = wrapper.find(".custom-list-buttons").at(0).find(Link);
    expect(firstListEdit.hasClass("disabled")).to.be.false;
    expect(firstListEdit.text()).to.equal("EditPencil Icon");
    wrapper.setProps({ identifier: 1 });
    firstListEdit = wrapper.find(".custom-list-buttons").at(0).find(Button).at(0);
    expect(firstListEdit.text()).to.equal("Editing");
    expect(firstListEdit.prop("disabled")).to.be.true;
  });

  it("displays the delete button only to library managers", () => {
    let deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(2);
    wrapper.setProps({ isLibraryManager: false });
    deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(0);
  });
});
