import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import BookDetailsContainer from "../BookDetailsContainer";
import BookDetailsTabContainer from "../BookDetailsTabContainer";
import BookDetails from "../BookDetails";

class DefaultBookDetails extends React.Component<any, any> {
  render() {
    return <div></div>;
  }
}

describe("BookDetailsContainer", () => {
  let wrapper;
  let store;
  let context;
  let refreshCatalog;
  const bookData = {
    id: "book id",
    url: "book url",
    title: "book title",
  };

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token",
      library: stub(),
      admin: { isLibraryManager: () => true },
    };
    refreshCatalog = stub();

    wrapper = shallow(
      <BookDetailsContainer
        book={bookData}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={refreshCatalog}
      >
        <DefaultBookDetails book={bookData} anotherProp="anotherProp" />
      </BookDetailsContainer>,
      { context }
    );
  });

  it("renders BookDetails with its child's props", () => {
    const bookDetails = wrapper.find(BookDetails);
    expect(bookDetails.prop("book")).to.equal(bookData);
    expect(bookDetails.prop("anotherProp")).to.equal("anotherProp");
  });

  it("shows a tab container with initial tab", () => {
    const tabContainer = wrapper.find(BookDetailsTabContainer);
    expect(tabContainer).to.be.ok;
    expect(tabContainer.props().bookUrl).to.equal("book url");
    expect(tabContainer.props().collectionUrl).to.equal("collection url");
    expect(tabContainer.props().library).to.equal(context.library);
    expect(tabContainer.props().csrfToken).to.equal("token");
    expect(tabContainer.props().refreshCatalog).to.equal(refreshCatalog);
    expect(tabContainer.props().store).to.equal(store);
  });
});
