jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { createStore, applyMiddleware } from "redux";
import * as thunk from "redux-thunk";

import createBookDetailsContainer from "../BookDetailsContainer";
import TabContainer from "../TabContainer";

let initialState = {
  book: {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null,
    editError: null
  },
  complaints: {
    url: null,
    data: null,
    isFetching: false,
    fetchError: null
  }
};

describe("createBookDetailsContainer", () => {
  it("creates a BookDetailsContainer", () => {
    let store = createStore((state = initialState, action) => state, applyMiddleware(thunk));
    let BookDetailsContainer = createBookDetailsContainer({
      editorStore: store,
      csrfToken: "token",
      onNavigate: jest.genMockFunction(),
      tab: "tab"
    });
    let container = TestUtils.renderIntoDocument(
      <BookDetailsContainer book={{ url: "book url" }} collection="collection url" />
    );
    let div = TestUtils.findRenderedDOMComponentWithClass(container, "bookDetailsContainer");
    expect(div).toBeTruthy;
  });
});

describe("BookDetailsContainer", () => {
  let BookDetailsContainer;
  let onNavigate;
  let container;
  let store;

  beforeEach(() => {
    store = createStore((state = initialState, action) => state, applyMiddleware(thunk));
    onNavigate = jest.genMockFunction();
    BookDetailsContainer = createBookDetailsContainer({
      editorStore: store,
      csrfToken: "token",
      onNavigate: onNavigate,
      tab: "tab"
    });
    container = TestUtils.renderIntoDocument(
      <BookDetailsContainer book={{ url: "book url" }} collection="collection url">
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsContainer>
    );
  });

  it("shows a tab container with initial tab", () => {
    let tabContainer = TestUtils.findRenderedComponentWithType(container, TabContainer);
    expect(tabContainer).toBeTruthy;
    expect(tabContainer.props.tab).toBe("tab");
  });

  it("gives an initial tab to TabContainer only once", () => {
    // mount container a second time
    container = TestUtils.renderIntoDocument(
      <BookDetailsContainer book={{ url: "book url" }} collection="collection url">
        <div className="bookDetails">Moby Dick</div>
      </BookDetailsContainer>
    );
    let tabContainer = TestUtils.findRenderedComponentWithType(container, TabContainer);
    expect(tabContainer.props.tab).toBe(null);
  });

  it("sets a tab", () => {
    container.setTab("edit");
    let items = TestUtils.scryRenderedDOMComponentsWithTag(container, "li");
    let activeItem = items.find(item => {
      let className = item.getAttribute("class");
      return className && className.indexOf("active") !== -1;
    });
    expect(activeItem.textContent).toBe("Edit");
  });
});