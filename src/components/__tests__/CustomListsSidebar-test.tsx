import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListsSidebar from "../CustomListsSidebar";
import { Link } from "react-router";

describe("CustomListsSidebar", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let lists;
  const deleteCustomList = stub();
  const changeSort = stub();

  beforeEach(() => {
    lists = [
      { id: 1, name: "First List", entry_count: 5 },
      { id: 2, name: "Second List", entry_count: 10 },
    ];
    wrapper = Enzyme.mount(
      <CustomListsSidebar
        lists={lists}
        library="library_name"
        identifier="123"
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

  it("renders a list of custom list info items", () => {
    const listOfLists = wrapper.find("ul");
    expect(listOfLists.length).to.equal(1);
    expect(listOfLists.children().length).to.equal(2);
    const firstList = listOfLists.find("li").at(0);
    const secondList = listOfLists.find("li").at(1);

    const firstListInfo = firstList.find(".custom-list-info");
    expect(firstListInfo.find("p").at(0).text()).to.equal("First List");
    expect(firstListInfo.find("p").at(1).text()).to.equal("Books in list: 5");
    expect(firstListInfo.find("p").at(2).text()).to.equal("ID-1");

    const secondListInfo = secondList.find(".custom-list-info");
    expect(secondListInfo.find("p").at(0).text()).to.equal("Second List");
    expect(secondListInfo.find("p").at(1).text()).to.equal("Books in list: 10");
    expect(secondListInfo.find("p").at(2).text()).to.equal("ID-2");
  });
});
