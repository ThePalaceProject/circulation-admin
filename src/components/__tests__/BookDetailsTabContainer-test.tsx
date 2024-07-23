import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import buildStore from "../../store";
import { BookDetailsTabContainer } from "../BookDetailsTabContainer";
import BookDetailsEditor from "../BookDetailsEditor";
import Classifications from "../Classifications";
import Complaints from "../Complaints";
import CustomListsForBook from "../CustomListsForBook";
import { mockRouterContext } from "./routing";

describe("BookDetailsTabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;

  const TEST_BOOK_URL = "book url";
  const TEST_COLLECTION_URL = "collection url";

  beforeEach(() => {
    store = buildStore();
    push = stub();
    context = mockRouterContext(push);
    wrapper = mount(
      <BookDetailsTabContainer
        bookUrl={TEST_BOOK_URL}
        collectionUrl={TEST_COLLECTION_URL}
        csrfToken="token"
        refreshCatalog={stub()}
        store={store}
        library={(a, b) => "library"}
        canSuppress={true}
        // from store
        complaintsCount={0}
        bookData={null}
        // dispatch actions
        clearBook={stub()}
        // required by TabContainer
        tab={null}
      >
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsTabContainer>,
      { context }
    );
  });

  it("shows book details", () => {
    const details = wrapper.find(".bookDetails");
    expect(details).to.be.ok;
  });

  it("shows details, edit, and classifications tabs", () => {
    const links = wrapper.find("ul.nav-tabs").find("a");
    const linkTexts = links.map((link) => link.text());
    expect(linkTexts).to.contain("Details");
    expect(linkTexts).to.contain("Edit");
    expect(linkTexts).to.contain("Classifications");
  });

  it("only shows cover tab when the book data has a change cover link", () => {
    let links = wrapper.find("ul.nav-tabs").find("a");
    let linkTexts = links.map((link) => link.text());
    expect(linkTexts).not.to.contain("Cover");

    const bookData = {
      title: "title",
      changeCoverLink: {
        href: "/change-cover",
        rel: "http://librarysimplified.org/terms/rel/change_cover",
      },
    };
    wrapper.setProps({ bookData });
    links = wrapper.find("ul.nav-tabs").find("a");
    linkTexts = links.map((link) => link.text());
    expect(linkTexts).to.contain("Cover");
  });

  it("shows editor", () => {
    const editor = wrapper.find(BookDetailsEditor);
    expect(editor.props().csrfToken).to.equal("token");
    expect(editor.props().bookUrl).to.equal(TEST_BOOK_URL);
  });

  it("shows classifications", () => {
    const classifications = wrapper.find(Classifications);
    expect(classifications.props().bookUrl).to.equal(TEST_BOOK_URL);
  });

  it("shows lists", () => {
    const lists = wrapper.find(CustomListsForBook);
    expect(lists.props().bookUrl).to.equal(TEST_BOOK_URL);
    expect(lists.props().library).to.equal("library");
  });

  it("uses router to navigate when tab is clicked", () => {
    const tabs = wrapper.find("ul.nav-tabs").find("a");
    tabs.at(1).simulate("click", { target: { dataset: { tabkey: "edit" } } });
    const label = tabs.at(1).text();
    expect(push.callCount).to.equal(1);
    expect(push.args[0][0]).to.equal(
      context.pathFor(TEST_COLLECTION_URL, TEST_BOOK_URL, label)
    );
  });

  it("clears book data when receiving new book url", () => {
    const clearBook = stub();
    wrapper.setProps({ clearBook });
    wrapper.setProps({ bookUrl: "new book url" });
    expect(clearBook.callCount).to.equal(1);
  });

  it("clears book data on unmount", () => {
    const clearBook = stub();
    wrapper.setProps({ clearBook });
    wrapper.unmount();
    expect(clearBook.callCount).to.equal(1);
  });
});
