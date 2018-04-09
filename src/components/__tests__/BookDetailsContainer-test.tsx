import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import BookDetailsContainer from "../BookDetailsContainer";
import BookDetailsTabContainer from "../BookDetailsTabContainer";

describe("BookDetailsContainer", () => {
  let wrapper;
  let store;
  let context;
  let refreshCatalog;
  let bookData = {
    id: "book id",
    url: "book url",
    title: "book title"
  };

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      tab: "tab",
      csrfToken: "token",
      library: stub()
    };
    refreshCatalog = stub();

    wrapper = shallow(
      <BookDetailsContainer
        book={bookData}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={refreshCatalog}>
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsContainer>,
      { context }
    );
  });

  it("shows a tab container with initial tab", () => {
    let tabContainer = wrapper.find(BookDetailsTabContainer);
    expect(tabContainer).to.be.ok;
    expect(tabContainer.props().bookUrl).to.equal("book url");
    expect(tabContainer.props().collectionUrl).to.equal("collection url");
    expect(tabContainer.props().tab).to.equal("tab");
    expect(tabContainer.props().library).to.equal(context.library);
    expect(tabContainer.props().csrfToken).to.equal("token");
    expect(tabContainer.props().refreshCatalog).to.equal(refreshCatalog);
    expect(tabContainer.props().store).to.equal(store);
    expect(tabContainer.children()).to.deep.equal(tabContainer.children());
  });
});
