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

    it("prepares collection url", () => {
      let host = "http://example.com";
      document.location.href = host + "/test";
      let url = host + "/groups/eng/Adult%20Fiction";
      expect(wrapper.instance().prepareCollectionUrl(url)).toBe("groups%2Feng%2FAdult%2520Fiction");
    });

    it("prepares book url", () => {
      let host = "http://example.com";
      document.location.href = host + "/test";
      let url = host + "/works/Axis%20360/Axis%20360%20ID/0016201449";
      expect(wrapper.instance().prepareBookUrl(url)).toBe("Axis%2520360%2FAxis%2520360%2520ID%2F0016201449");
    });

    it("returns a path with collection, book, and tab", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, bookUrl, tab);
      expect(path).toBe(
        `/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
        `/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`
      );
    });

    it("returns a path with collection and book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, bookUrl, null);
      expect(path).toBe(
        `/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
        `/book/${instance.prepareBookUrl(bookUrl)}`
      );
    });

    it("returns a path with only collection", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, null, null);
      expect(path).toBe(`/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}`);
    });

    it("returns a path with only book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(null, bookUrl, null);
      expect(path).toBe(`/admin/web/book/${instance.prepareBookUrl(bookUrl)}`);
    });

    it("returns a path with book and tab", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(null, bookUrl, tab);
      expect(path).toBe(`/admin/web/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`);
    });

    it("returns a path with no collection, book, or tab", () => {
      let path = wrapper.instance().pathFor(null, null, null);
      expect(path).toBe(`/admin/web`);
    });
  });
});