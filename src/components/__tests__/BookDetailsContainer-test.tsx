jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { createStore, applyMiddleware } from "redux";
import * as thunk from "redux-thunk";

import createBookDetailsContainer from "../BookDetailsContainer";
import Editor from "../Editor";
import Complaints from "../Complaints";

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

  it("shows book details", () => {
    let details = TestUtils.findRenderedDOMComponentWithClass(container, "bookDetails");
    expect(details).toBeTruthy;
  });

  it("shows details and edit tabs", () => {
    let links = TestUtils.scryRenderedDOMComponentsWithTag(container, "a");
    let linkTexts = links.map(link => link.textContent);
    expect(linkTexts).toContain("Details");
    expect(linkTexts).toContain("Edit");
  });

  it("shows Editor", () => {
    let editor = TestUtils.findRenderedComponentWithType(container, Editor);
    expect(editor.props.csrfToken).toBe("token");
    expect(editor.props.book).toBe("book url");
  });

  it("calls onNavigate when tab is clicked", () => {
    let tabs = TestUtils.scryRenderedDOMComponentsWithTag(container, "a");
    TestUtils.Simulate.click(tabs[1]);
    expect(onNavigate.mock.calls.length).toBe(1);
    expect(onNavigate.mock.calls[0][0]).toBe("collection url");
    expect(onNavigate.mock.calls[0][1]).toBe("book url");
    expect(onNavigate.mock.calls[0][2]).toBe("edit");
  });
});