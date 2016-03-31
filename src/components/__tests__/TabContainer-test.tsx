jest.autoMockOff();

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";

import buildStore from "../../store";
import { TabContainer } from "../TabContainer";
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

describe("TabContainer", () => {
  let container;
  let navigate;
  let store;

  beforeEach(() => {
    navigate = jest.genMockFunction();
    store = buildStore();
    container = TestUtils.renderIntoDocument(
      <TabContainer
        book="book url"
        collection="collection url"
        tab={null}
        navigate={navigate}
        csrfToken="token"
        refreshBook={jest.genMockFunction()}
        store={store}
        >
        <div className="bookDetails">Moby Dick</div>
      </TabContainer>
    );
  });

  it("shows book details", () => {
    let details = TestUtils.findRenderedDOMComponentWithClass(container, "bookDetails");
    expect(details).toBeTruthy;
  });

  it("shows details and edit and complaints tabs", () => {
    let links = TestUtils.scryRenderedDOMComponentsWithTag(container, "a");
    let linkTexts = links.map(link => link.textContent);
    expect(linkTexts).toContain("Details");
    expect(linkTexts).toContain("Edit");
    expect(linkTexts).toContain("Complaints");
  });

  it("shows Editor", () => {
    let editor = TestUtils.findRenderedComponentWithType(container, Editor);
    expect(editor.props.csrfToken).toBe("token");
    expect(editor.props.book).toBe("book url");
  });

  it("shows Complaints", () => {
    let complaints = TestUtils.findRenderedComponentWithType(container, Complaints);
    expect(complaints.props.book).toBe("book url");
  });

  it("calls navigate when tab is clicked", () => {
    let tabs = TestUtils.scryRenderedDOMComponentsWithTag(container, "a");
    TestUtils.Simulate.click(tabs[1]);
    expect(navigate.mock.calls.length).toBe(1);
    expect(navigate.mock.calls[0][0]).toBe("collection url");
    expect(navigate.mock.calls[0][1]).toBe("book url");
    expect(navigate.mock.calls[0][2]).toBe(false);
    expect(navigate.mock.calls[0][3]).toBe("edit");
  });

  it("shows complaints count", () => {
    container = TestUtils.renderIntoDocument(
      <TabContainer {...container.props} store={store} complaintsCount={5}>
        <div className="bookDetails">Moby Dick</div>
      </TabContainer>
    );

    let links = TestUtils.scryRenderedDOMComponentsWithTag(container, "a");
    let linkTexts = links.map(link => link.textContent);
    expect(linkTexts).toContain("Complaints (5)");
  });
});