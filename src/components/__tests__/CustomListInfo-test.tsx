import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import CustomListInfo from "../CustomListInfo";
import { Link } from "react-router";
import { Button } from "library-simplified-reusable-components";
import { ListManagerProvider } from "../ListManagerContext";

describe("CustomListsInfo", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  let list;
  let identifier;
  const deleteCustomList = stub();

  beforeEach(() => {
    list = { id: 1, name: "First List", entry_count: 5 };
    wrapper = Enzyme.mount(
      <ListManagerProvider
        email="test@test.com"
        roles={[{ library: "OWL", role: "system" }]}
        csrfToken="token"
      >
        <CustomListInfo
          list={list}
          library="library_name"
          identifier={identifier}
          deleteCustomList={deleteCustomList}
        />
      </ListManagerProvider>
    );
  });

  it("correctly renders a list's information", () => {
    const list = wrapper.find("li");
    expect(list.length).to.equal(1);

    const listInfo = list.find(".custom-list-info");
    expect(listInfo.find("p").at(0).text()).to.equal("First List");
    expect(listInfo.find("p").at(1).text()).to.equal("Books in list: 5");
    expect(listInfo.find("p").at(2).text()).to.equal("ID-1");

    const listButtons = list.find(".custom-list-buttons");
    const listEdit = listButtons.find(Link).at(0);
    const listDelete = listButtons.find(Button).at(0);
    expect(listEdit.text()).to.contain("Edit");
    expect(listEdit.prop("to")).to.equal(
      "/admin/web/lists/library_name/edit/1"
    );
    expect(listDelete.text()).to.contain("Delete");
    listDelete.simulate("click");
    expect(deleteCustomList.callCount).to.equal(1);
  });

  it("disables the edit button if the list is already being edited", () => {
    let firstListEdit = wrapper.find(".custom-list-buttons").at(0).find(Link);
    expect(firstListEdit.hasClass("disabled")).to.be.false;
    expect(firstListEdit.text()).to.equal("EditPencil Icon");
    wrapper.setProps({
      children: (
        <CustomListInfo
          list={list}
          library="library_name"
          identifier="1"
          deleteCustomList={deleteCustomList}
        />
      ),
    });
    firstListEdit = wrapper
      .find(".custom-list-buttons")
      .at(0)
      .find(Button)
      .at(0);
    expect(firstListEdit.text()).to.equal("Editing");
    expect(firstListEdit.prop("disabled")).to.be.true;
  });

  it("displays the delete button only to library managers", () => {
    const deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(1);
  });

  it("does not display the delete button to non-managers", () => {
    wrapper = Enzyme.mount(
      <ListManagerProvider
        email="test@test.com"
        roles={[{ library: "OWL", role: "librarian" }]}
      >
        <CustomListInfo
          list={list}
          library="library_name"
          identifier="123"
          deleteCustomList={deleteCustomList}
        />
      </ListManagerProvider>
    );
    const deleteButtons = wrapper.find(".custom-list-buttons button");
    expect(deleteButtons.length).to.equal(0);
  });
});
