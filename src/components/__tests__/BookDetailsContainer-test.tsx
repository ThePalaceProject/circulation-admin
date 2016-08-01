jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import BookDetailsContainer from "../BookDetailsContainer";
import TabContainer from "../TabContainer";

let promise = new Promise((resolve, reject) => resolve());

describe("BookDetailsContainer", () => {
  let wrapper;
  let store;
  let context;
  let refreshCatalog;

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      tab: "tab",
      csrfToken: "token"
    };
    refreshCatalog = jest.genMockFunction();

    wrapper = shallow(
      <BookDetailsContainer
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={refreshCatalog}
        borrowBook={jest.genMockFunction().mockReturnValue(promise)}
        fulfillBook={jest.genMockFunction().mockReturnValue(promise)}>
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsContainer>,
      { context }
    );
  });

  it("shows a tab container with initial tab", () => {
    let tabContainer = wrapper.find(TabContainer);
    expect(tabContainer).toBeTruthy();
    expect(tabContainer.props().bookUrl).toBe("book url");
    expect(tabContainer.props().collectionUrl).toBe("collection url");
    expect(tabContainer.props().tab).toBe("tab");
    expect(tabContainer.props().csrfToken).toBe("token");
    expect(tabContainer.props().refreshCatalog).toBe(refreshCatalog);
    expect(tabContainer.props().store).toBe(store);
    expect(tabContainer.children()).toEqual(tabContainer.children());
  });
});