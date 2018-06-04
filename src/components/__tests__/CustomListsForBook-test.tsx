import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { CustomListsForBook } from "../CustomListsForBook";
import ErrorMessage from "../ErrorMessage";
import WithRemoveButton from "../WithRemoveButton";
import Autocomplete from "../Autocomplete";

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
    wrapper = shallow(
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
      expect(link.length).to.equal(1);
      expect(link.props().href).to.equal("/admin/web/lists/library/edit/2");
      expect(link.text()).to.equal("list 2");
    });

    it("shows available lists", () => {
      let autocomplete = wrapper.find(Autocomplete);
      expect(autocomplete.length).to.equal(1);
      let availableLists = autocomplete.props().autocompleteValues;
      expect(availableLists).to.deep.equal(["list 1", "list 3"]);

      let button = wrapper.find("button");
      expect(button.length).to.equal(1);
      expect(button.text()).to.contain("Add");
    });

    it("disables while fetching", () => {
      wrapper.setProps({ isFetching: true });
      let removable = wrapper.find(WithRemoveButton);
      expect(removable.props().disabled).to.equal(true);
      let autocomplete = wrapper.find(Autocomplete);
      expect(autocomplete.props().disabled).to.equal(true);
    });
  });

  describe("behavior", () => {
    it("fetches lists on mount", () => {
      expect(refreshCatalog.callCount).to.equal(0);
      expect(fetchAllCustomLists.callCount).to.equal(1);
      expect(fetchCustomListsForBook.callCount).to.equal(1);
      expect(fetchCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");
    });

    it("adds a list", () => {
      let autocompleteStub = stub(Autocomplete.prototype, "getValue");

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
      // Add one of the existing lists.
      autocompleteStub.returns("list 1");
      let addButton = wrapper.find("button");
      addButton.simulate("click");

      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(2);

      let links = wrapper.find("h4 a");
      expect(links.length).to.equal(2);
      expect(links.at(0).props().href).to.equal("/admin/web/lists/library/edit/2");
      expect(links.at(0).text()).to.equal("list 2");
      expect(links.at(1).props().href).to.equal("/admin/web/lists/library/edit/1");
      expect(links.at(1).text()).to.equal("list 1");

      expect(editCustomListsForBook.callCount).to.equal(1);
      expect(editCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([allCustomLists[1], allCustomLists[0]]);

      // Also add a new list.
      autocompleteStub.returns("new list");
      addButton.simulate("click");

      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(3);

      // The new list doesn't get a link since it doesn't have its own page yet.
      links = wrapper.find("h4 a");
      expect(links.length).to.equal(2);
      expect(links.at(0).props().href).to.equal("/admin/web/lists/library/edit/2");
      expect(links.at(0).text()).to.equal("list 2");
      expect(links.at(1).props().href).to.equal("/admin/web/lists/library/edit/1");
      expect(links.at(1).text()).to.equal("list 1");

      // But it's still in the list.
      let listNames = wrapper.find("h4");
      expect(listNames.length).to.equal(3);
      expect(listNames.at(2).text()).to.equal("new list");

      expect(editCustomListsForBook.callCount).to.equal(2);
      expect(editCustomListsForBook.args[1][0]).to.equal("admin/works/book url/lists");
      formData = editCustomListsForBook.args[1][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal(
        [allCustomLists[1], allCustomLists[0], { name: "new list" }]);

      autocompleteStub.restore();
    });

    it("removes a list", () => {
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

      let removable = wrapper.find(WithRemoveButton);
      expect(removable.length).to.equal(1);
      let removeButton = removable.find(".remove");
      removeButton.simulate("click");

      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(0);
      let links = wrapper.find("a");
      expect(links.length).to.equal(0);

      expect(editCustomListsForBook.callCount).to.equal(1);
      expect(editCustomListsForBook.args[0][0]).to.equal("admin/works/book url/lists");
      let formData = editCustomListsForBook.args[0][1];
      expect(JSON.parse(formData.get("lists"))).to.deep.equal([]);
    });
  });
});