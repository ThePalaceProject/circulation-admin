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

  beforeEach(() => {
    store = buildStore();
    push = stub();
    context = mockRouterContext(push);
    wrapper = mount(
      <BookDetailsTabContainer
        bookUrl="book url"
        collectionUrl="collection url"
        tab={null}
        csrfToken="token"
        refreshCatalog={stub()}
        store={store}
        library={(a,b) => "library"}
        >
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsTabContainer>,
      { context }
    );
  });

  it("shows book details", () => {
    let details = wrapper.find(".bookDetails");
    expect(details).to.be.ok;
  });

  it("shows details, edit, classifications, and complaints tabs", () => {
    let links = wrapper.find("ul.nav-tabs").find("a");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).to.contain("Details");
    expect(linkTexts).to.contain("Edit");
    expect(linkTexts).to.contain("Classifications");
    expect(linkTexts).to.contain("Complaints");
  });

  it("only shows cover tab when the book data has a change cover link", () => {
    let links = wrapper.find("ul.nav-tabs").find("a");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).not.to.contain("Cover");

    let bookData = {
      title: "title",
      changeCoverLink: {
        href: "/change-cover",
        rel: "http://librarysimplified.org/terms/rel/change_cover"
      }
    };
    wrapper.setProps({ bookData });
    links = wrapper.find("ul.nav-tabs").find("a");
    linkTexts = links.map(link => link.text());
    expect(linkTexts).to.contain("Cover");
  });

  it("shows editor", () => {
    let editor = wrapper.find(BookDetailsEditor);
    expect(editor.props().csrfToken).to.equal("token");
    expect(editor.props().bookUrl).to.equal("book url");
  });

  it("shows classifications", () => {
    let classifications = wrapper.find(Classifications);
    expect(classifications.props().bookUrl).to.equal("book url");
  });

  it("shows Complaints", () => {
    let complaints = wrapper.find(Complaints);
    expect(complaints.props().bookUrl).to.equal("book url");
  });

  it("shows lists", () => {
    let lists = wrapper.find(CustomListsForBook);
    expect(lists.props().bookUrl).to.equal("book url");
    expect(lists.props().library).to.equal("library");
  });

  it("uses router to navigate when tab is clicked", () => {
    let tabs = wrapper.find("ul.nav-tabs").find("a");
    tabs.at(1).simulate("click", { target : { dataset: { tabkey: "edit" } } });
    let label = tabs.at(1).text();
    expect(push.callCount).to.equal(1);
    expect(push.args[0][0]).to.equal(context.pathFor("collection url", "book url", label));
  });

  it("shows complaints count", () => {
    wrapper.setProps({ complaintsCount: 5 });

    let links = wrapper.find("ul.nav-tabs").find("a");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).to.contain("Complaints (5)");
  });

  it("clears book data when receiving new book url", () => {
    let clearBook = stub();
    wrapper.setProps({ clearBook });
    wrapper.setProps({ bookUrl: "new book url" });
    expect(clearBook.callCount).to.equal(1);
  });

  it("clears book data on unmount", () => {
    let clearBook = stub();
    wrapper.setProps({ clearBook });
    wrapper.unmount();
    expect(clearBook.callCount).to.equal(1);
  });
});
