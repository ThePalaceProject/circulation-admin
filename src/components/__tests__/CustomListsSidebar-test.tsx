import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import * as Enzyme from "enzyme";

import CustomListsSidebar from "../CustomListsSidebar";
import { Link } from "react-router";
import { Button } from "library-simplified-reusable-components";

describe("CustomListsSidebar", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let lists;
  const deleteCustomList = stub();
  const changeSort = stub();

  beforeEach(() => {
    lists = [
      { id: 1, name: "First List", entry_count: 5, is_owner: true },
      { id: 2, name: "Second List", entry_count: 10, is_owner: true },
    ];
    wrapper = Enzyme.mount(
      <CustomListsSidebar
        filter="owned"
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
    const createButton = wrapper.find(Link).at(0);
    expect(createButton.text()).to.equal("Create New List");
    expect(createButton.prop("to")).to.equal(
      "/admin/web/lists/library_name/create"
    );
  });

  it("renders filter select", () => {
    const select = wrapper.find('select[name="filter"]');

    expect(select.prop("value")).to.equal("owned");

    const options = select.find("option");

    expect(options.length).to.equal(4);

    expect(options.at(0).prop("value")).to.equal("");
    expect(options.at(1).prop("value")).to.equal("owned");
    expect(options.at(2).prop("value")).to.equal("shared-out");
    expect(options.at(3).prop("value")).to.equal("shared-in");
  });

  it("renders sort select", () => {
    const select = wrapper.find('select[name="sort"]');

    expect(select.prop("value")).to.equal("asc");

    const options = select.find("option");

    expect(options.length).to.equal(2);

    expect(options.at(0).prop("value")).to.equal("asc");
    expect(options.at(1).prop("value")).to.equal("desc");
  });

  it("renders a list of custom list info items", () => {
    const listOfLists = wrapper.find("ul");
    expect(listOfLists.length).to.equal(1);
    const firstList = listOfLists.find("li").at(0);
    const secondList = listOfLists.find("li").at(1);

    const firstListInfo = firstList.find(".custom-list-info > div");
    expect(firstListInfo.at(0).text()).to.equal("First List");
    expect(firstListInfo.at(1).text()).to.equal("Books in list: 5");
    expect(firstListInfo.at(2).text()).to.equal("ID-1");

    const firstListButtons = firstList.find(".custom-list-buttons");
    const firstListEdit = firstListButtons.find(Link).at(0);
    const firstListDelete = firstListButtons.find(Button).at(0);
    expect(firstListEdit.text()).to.contain("Edit");
    expect(firstListEdit.prop("to")).to.equal(
      "/admin/web/lists/library_name/edit/1"
    );
    expect(firstListDelete.text()).to.contain("Delete");
    firstListDelete.simulate("click");
    expect(deleteCustomList.callCount).to.equal(1);

    const secondListInfo = secondList.find(".custom-list-info > div");
    expect(secondListInfo.at(0).text()).to.equal("Second List");
    expect(secondListInfo.at(1).text()).to.equal("Books in list: 10");
    expect(secondListInfo.at(2).text()).to.equal("ID-2");

    const secondListButtons = secondList.find(".custom-list-buttons");
    const secondListEdit = secondListButtons.find(Link).at(0);
    const secondListDelete = secondListButtons.find(Button).at(0);
    expect(secondListEdit.text()).to.contain("Edit");
    expect(secondListEdit.prop("to")).to.equal(
      "/admin/web/lists/library_name/edit/2"
    );
    expect(secondListDelete.text()).to.contain("Delete");
    secondListDelete.simulate("click");
    expect(deleteCustomList.callCount).to.equal(2);
  });

  it("disables the edit button if the list is already being edited", () => {
    let firstListEdit = wrapper.find(".custom-list-buttons").at(0).find(Link);
    expect(firstListEdit.hasClass("disabled")).to.be.false;
    expect(firstListEdit.text()).to.equal("EditPencil Icon");
    wrapper.setProps({ identifier: 1 });
    firstListEdit = wrapper
      .find(".custom-list-buttons")
      .at(0)
      .find(Button)
      .at(0);
    expect(firstListEdit.text()).to.equal("Editing");
    expect(firstListEdit.prop("disabled")).to.be.true;
  });

  it("renders a view button instead of an edit button if a list is not owned", () => {
    wrapper.setProps({
      lists: [{ id: 1, name: "First List", entry_count: 5, is_owner: false }],
    });

    const firstListEdit = wrapper.find(".custom-list-buttons").at(0).find(Link);
    expect(firstListEdit.hasClass("disabled")).to.be.false;
    expect(firstListEdit.text()).to.equal("ViewVisible Icon");
  });

  it("displays the delete button only to library managers", () => {
    let deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(2);
    wrapper.setProps({ isLibraryManager: false });
    deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(0);
  });

  it("does not render a delete button if a list is not owned", () => {
    wrapper.setProps({
      lists: [{ id: 1, name: "First List", entry_count: 5, is_owner: false }],
    });

    const buttons = wrapper.find(".custom-list-buttons button");
    expect(buttons.length).to.equal(0);
  });

  it("does not render a delete button if a list is shared", () => {
    wrapper.setProps({
      lists: [
        {
          id: 1,
          name: "First List",
          entry_count: 5,
          is_owner: true,
          is_shared: true,
        },
      ],
    });

    const buttons = wrapper.find(".custom-list-buttons button");
    expect(buttons.length).to.equal(0);
  });
});
