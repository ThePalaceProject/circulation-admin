jest.autoMockOff();

import * as React from "react";
import { mount } from "enzyme";

import buildStore from "../../store";
import { TabContainer } from "../TabContainer";
import Editor from "../Editor";
import Classifications from "../Classifications";
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
  let wrapper
  let navigate;
  let store;

  beforeEach(() => {
    navigate = jest.genMockFunction();
    store = buildStore();
    wrapper = mount(
      <TabContainer
        bookUrl="book url"
        collectionUrl="collection url"
        tab={null}
        navigate={navigate}
        csrfToken="token"
        refreshBrowser={jest.genMockFunction()}
        store={store}
        >
        <div className="bookDetails">Moby Dick</div>
      </TabContainer>
    );
  });

  it("shows book details", () => {
    let details = wrapper.find(".bookDetails");
    expect(details).toBeTruthy;
  });

  it("shows details, edit, classifications, and complaints tabs", () => {
    let links = wrapper.find("a[role='tab']");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).toContain("Details");
    expect(linkTexts).toContain("Edit");
    expect(linkTexts).toContain("Classifications");
    expect(linkTexts).toContain("Complaints");
  });

  it("shows Editor", () => {
    let editor = wrapper.find(Editor);
    expect(editor.props().csrfToken).toBe("token");
    expect(editor.props().bookUrl).toBe("book url");
  });

  it("shows classifications", () => {
    let classifications = wrapper.find(Classifications);
    expect(classifications.props().bookUrl).toBe("book url");
  });

  it("shows Complaints", () => {
    let complaints = wrapper.find(Complaints);
    expect(complaints.props().bookUrl).toBe("book url");
  });

  it("calls navigate when tab is clicked", () => {
    let tabs = wrapper.find("a[role='tab']");
    tabs.at(1).simulate("click");
    expect(navigate.mock.calls.length).toBe(1);
    expect(navigate.mock.calls[0][0]).toBe("collection url");
    expect(navigate.mock.calls[0][1]).toBe("book url");
    expect(navigate.mock.calls[0][2]).toBe("edit");
  });

  it("shows complaints count", () => {
    wrapper.setProps({ complaintsCount: 5 });

    let links = wrapper.find("a[role='tab']");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).toContain("Complaints (5)");
  });

  it("clears book on unount", () => {
    let clearBook = jest.genMockFunction();
    wrapper.setProps({ clearBook });
    wrapper.unmount();
    expect(clearBook.mock.calls.length).toBe(1);
  });
});