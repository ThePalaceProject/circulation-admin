import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";
import { CustomListsForBook } from "../CustomListsForBook";
import ErrorMessage from "../ErrorMessage";
import WithRemoveButton from "../WithRemoveButton";
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
      let link = removable.find("a");
      expect(link.length).to.equal(1);
      expect(link.props().href).to.equal("/admin/web/lists/library/edit/2");
      expect(link.text()).to.equal("list 2");
    });

    it("shows placeholder text if there are no current lists", async () => {
      let placeholder = (wrapper.find(".input-list > span"));
      expect(placeholder.length).to.equal(0);
      wrapper.setProps({ customListsForBook: [] });
      placeholder = (wrapper.find(".input-list > span"));
      expect(placeholder.length).to.equal(1);
      expect(placeholder.text()).to.equal("This book is not currently on any lists.");
    });

    it("creates a URL based on list ID", () => {
      let url1 = wrapper.instance().makeURL("list 1");
      expect(url1).to.equal("/admin/web/lists/library/edit/1");
      let url2 = wrapper.instance().makeURL("list 2");
      expect(url2).to.equal("/admin/web/lists/library/edit/2");
      // Making sure that it's actually using the ID, not just the number in the name...
      let newList = { name: "new", id: "42" };
      wrapper.setProps({ allCustomLists: allCustomLists.concat([newList] )});
      let newUrl = wrapper.instance().makeURL("new");
      expect(newUrl).to.equal("/admin/web/lists/library/edit/42");
    });

    it("shows a menu of available lists", () => {
      let availableLists = wrapper.find("select");
      expect(availableLists.length).to.equal(1);
      expect(availableLists.find("option").map(o => o.prop("value"))).to.deep.equal(["list 1", "list 3"]);
      let label = availableLists.closest("label");
      expect(label.length).to.equal(1);
      expect(label.text()).to.contain("Select an existing list");
      let button = wrapper.find(".add-list-item-container").find(Button);
      expect(button.length).to.equal(1);
      expect(button.prop("content")).to.equal("Add");
    });

    it("does not show the InputList if no lists exist", async () => {
      let inputList = wrapper.find(InputList);
      expect(inputList.length).to.equal(1);
      wrapper.setProps({ allCustomLists: [] });
      await new Promise((resolve) => setTimeout(resolve, 0));
      wrapper.update();
      inputList = wrapper.find(InputList);
      expect(inputList.length).to.equal(0);
      expect(wrapper.find("p").at(0).text()).to.equal("There are no available lists.");
    });

    it("disables while fetching", () => {
      wrapper.setProps({ isFetching: true });
      let removable = wrapper.find(WithRemoveButton);
      expect(removable.props().disabled).to.equal(true);
      let inputList = wrapper.find(InputList);
      expect(inputList.props().disabled).to.equal(true);
    });

    it("displays a link to the list creator", () => {
      let linkDiv = wrapper.find("div").last();
      let link = linkDiv.find("a");
      expect(link.prop("href")).to.equal("/admin/web/lists/library/create");
      expect(link.text()).to.equal("Create a new list");
      expect(linkDiv.find("p").text()).to.equal(
        "(The book title will be copied to the clipboard so that you can easily search for it on the list creator page.)"
      );
      let copyTitle = stub(wrapper.instance(), "copyTitle").returns(wrapper.prop("book").title);
      wrapper.setProps({ copyTitle });
      expect(copyTitle.callCount).to.equal(0);
      linkDiv.simulate("click");
      expect(copyTitle.callCount).to.equal(1);
      expect(copyTitle()).to.equal("test title");
      copyTitle.restore();
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

    it("adds a list", async () => {
      expect(editCustomListsForBook.callCount).to.equal(0);
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(1);
      expect(removables.find("a").text()).to.equal("list 2");

      let menu = wrapper.find("select");
      menu.getDOMNode().value = "list 1";
      menu.simulate("change");
      wrapper.find("button.add-list-item").simulate("click");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(editCustomListsForBook.callCount).to.equal(1);
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([
        {id: "2", name: "list 2"},
        {id: "1", name: "list 1"}
      ]);
      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(2);
      expect(removables.at(0).find("a").text()).to.equal("list 2");
      expect(removables.at(1).find("a").text()).to.equal("list 1");
    });

    it("removes a list", async () => {
      expect(editCustomListsForBook.callCount).to.equal(0);
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(1);
      let removeButton = removables.find(Button);
      removeButton.simulate("click");
      await new Promise((resolve) => setTimeout(resolve, 0));

      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(0);
      let links = wrapper.find(WithRemoveButton).find("a");
      expect(links.length).to.equal(0);

      expect(editCustomListsForBook.callCount).to.equal(1);
      expect(editCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([]);
    });
  });
});
