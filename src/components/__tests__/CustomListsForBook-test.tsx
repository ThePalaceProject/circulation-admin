import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";
import { CustomListsForBook } from "../CustomListsForBook";
import ErrorMessage from "../ErrorMessage";
import WithRemoveButton from "../WithRemoveButton";
import ProtocolFormField from "../ProtocolFormField";
import Autocomplete from "../Autocomplete";
import InputList from "../InputList";

describe("CustomListsForBook", () => {
  let wrapper;
  let fetchAllCustomLists;
  let fetchCustomListsForBook;
  let editCustomListsForBook;
  let refreshCatalog;
  let bookData = {
    id: "id",
    title: "test title"
  };
  let allCustomLists = [
    { id: "1", name: "list 1"},
    { id: "2", name: "list 2"},
    { id: "3", name: "list 3"}
  ];
  let customListsForBook = [
    { id: "2", name: "list 2"}
  ];

  beforeEach(() => {
    fetchAllCustomLists = stub();
    fetchCustomListsForBook = stub();
    editCustomListsForBook = stub().returns(new Promise<void>(resolve => resolve()));
    refreshCatalog = stub();
    wrapper = mount(
      <CustomListsForBook
        csrfToken="token"
        book={bookData}
        bookUrl="works/book url"
        library="library"
        allCustomLists={allCustomLists}
        customListsForBook={customListsForBook}
        fetchAllCustomLists={fetchAllCustomLists}
        fetchCustomListsForBook={fetchCustomListsForBook}
        editCustomListsForBook={editCustomListsForBook}
        refreshCatalog={refreshCatalog}
        />
    );
  });

  describe("rendering", () => {
    it("shows error message", () => {
      let error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(0);

      wrapper.setProps({ fetchError: { error: "error" }});
      error = wrapper.find(ErrorMessage);
      expect(error.length).to.equal(1);
    });

    it("shows book title", () => {
      let title = wrapper.find("h2");
      expect(title.text()).to.equal("test title");
    });

    it("shows current lists", () => {
      let removable = wrapper.find(WithRemoveButton);
      expect(removable.length).to.equal(1);

      let link = wrapper.find("a");
      // expect(link.length).to.equal(1);
      // expect(link.props().href).to.equal("/admin/web/lists/library/edit/2");
      // expect(link.text()).to.equal("list 2");
    });

    it("shows available lists", () => {
      let availableLists = wrapper.find("select");
      expect(availableLists.length).to.equal(1);
      expect(availableLists.find("option").map(o => o.prop("value"))).to.deep.equal(["list 1", "list 3"]);
      let button = wrapper.find(".add-list-item-container").find(Button);
      expect(button.length).to.equal(1);
      expect(button.prop("content")).to.equal("Add");
    });

    it("disables while fetching", () => {
      wrapper.setProps({ isFetching: true });
      let removable = wrapper.find(WithRemoveButton);
      expect(removable.props().disabled).to.equal(true);
      let inputList = wrapper.find(InputList);
      expect(inputList.props().disabled).to.equal(true);
    });
  });

  describe("behavior", () => {
    it("fetches lists on mount", () => {
      expect(refreshCatalog.callCount).to.equal(0);
      expect(fetchCustomListsForBook.callCount).to.equal(1);
      expect(fetchCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");

      // It only fetches all custom lists if they have not already been fetched.
      expect(fetchAllCustomLists.callCount).to.equal(0);

      // Remount without a value for allCustomLists, and it fetches them.
      wrapper = mount(
        <CustomListsForBook
          csrfToken="token"
          book={bookData}
          bookUrl="works/book url"
          library="library"
          customListsForBook={customListsForBook}
          fetchAllCustomLists={fetchAllCustomLists}
          fetchCustomListsForBook={fetchCustomListsForBook}
          editCustomListsForBook={editCustomListsForBook}
          refreshCatalog={refreshCatalog}
        />
      );
      expect(fetchAllCustomLists.callCount).to.equal(1);
    });

    it("adds a list", () => {
      expect(editCustomListsForBook.callCount).to.equal(0);
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(1);
      expect(removables.find("input").prop("value")).to.equal("list 2");

      let menu = wrapper.find("select");
      menu.getDOMNode().value = "list 1";
      menu.simulate("change");
      wrapper.find("button.add-list-item").simulate("click");

      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(2);
      expect(removables.at(0).find("input").prop("value")).to.equal("list 2");
      expect(removables.at(1).find("input").prop("value")).to.equal("list 1");

      // Click the submit button to trigger the callback
      wrapper.find(Button).last().simulate("click");
      expect(editCustomListsForBook.callCount).to.equal(1);
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([
        {id: "2", name: "list 2"},
        {id: "1", name: "list 1"}
      ]);
    });

    it("removes a list", () => {
      expect(editCustomListsForBook.callCount).to.equal(0);
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(1);
      let removeButton = removables.find(Button);
      removeButton.simulate("click");

      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(0);
      // Click the submit button to trigger the callback
      wrapper.find(Button).last().simulate("click");
      // let links = wrapper.find("a");
      // expect(links.length).to.equal(0);
      //
      expect(editCustomListsForBook.callCount).to.equal(1);
      // expect(editCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([]);
    });
  });
});
