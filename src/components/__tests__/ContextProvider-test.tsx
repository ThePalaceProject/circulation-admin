jest.autoMockOff();

import * as React from "react";
import { shallow } from "enzyme";

import ContextProvider from "../ContextProvider";

class FakeChild extends React.Component<any, any> {}

describe("ContextProvider", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <ContextProvider
        csrfToken="token"
        homeUrl="home url">
        <FakeChild />
      </ContextProvider>
    );
  });

  it("provides child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.editorStore.getState().editor).toBeTruthy();
    expect(context.editorStore.getState().catalog).toBeTruthy();
    expect(context.pathFor).toBe(wrapper.instance().pathFor);
    expect(context.csrfToken).toBe("token");
    expect(context.homeUrl).toBe("home url");
  });

  it("renders child", () => {
    let children = wrapper.find(FakeChild);
    expect(children.length).toBe(1);
  });

  describe("pathFor", () => {
    let collectionUrl = "collection/url";
    let bookUrl = "book/url";
    let tab = "tab";

    it("returns a path with collection, book, and tab", () => {
      let path = wrapper.instance().pathFor(collectionUrl, bookUrl, tab);
      expect(path).toBe(`/admin/web/collection/${encodeURIComponent(collectionUrl)}/book/${encodeURIComponent(bookUrl)}/tab/${tab}`);
    });

    it("returns a path with collection and book", () => {
      let path = wrapper.instance().pathFor(collectionUrl, bookUrl, null);
      expect(path).toBe(`/admin/web/collection/${encodeURIComponent(collectionUrl)}/book/${encodeURIComponent(bookUrl)}`);
    });

    it("returns a path with only collection", () => {
      let path = wrapper.instance().pathFor(collectionUrl, null, null);
      expect(path).toBe(`/admin/web/collection/${encodeURIComponent(collectionUrl)}`);
    });

    it("returns a path with only book", () => {
      let path = wrapper.instance().pathFor(null, bookUrl, null);
      expect(path).toBe(`/admin/web/book/${encodeURIComponent(bookUrl)}`);
    });

    it("returns a path with book and tab", () => {
      let path = wrapper.instance().pathFor(null, bookUrl, tab);
      expect(path).toBe(`/admin/web/book/${encodeURIComponent(bookUrl)}/tab/${tab}`);
    });

    it("returns a path with no collection, book, or tab", () => {
      let path = wrapper.instance().pathFor(null, null, null);
      expect(path).toBe(`/admin/web`);
    });
  });
});