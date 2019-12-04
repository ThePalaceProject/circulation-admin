import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import * as jsdom from "jsdom";

import ContextProvider from "../ContextProvider";
import Admin from "../../models/Admin";
import * as PropTypes from "prop-types";
import { stub } from "sinon";

class FakeChild extends React.Component<{}, {}> {}

describe("ContextProvider", () => {
  let wrapper;
  let instance;
  let pathFor;

  beforeEach(() => {
    wrapper = shallow(
      <ContextProvider
        csrfToken="token"
        roles={ [{ "role": "system" }] }
        email="email"
      >
        <FakeChild />
      </ContextProvider>
    );
    instance = wrapper.instance();
    pathFor = instance.pathFor;
  });

  it("provides child context", () => {
    let context = instance.getChildContext();
    expect(context.editorStore.getState().editor).to.be.ok;
    expect(context.editorStore.getState().catalog).to.be.ok;
    expect(context.csrfToken).to.equal("token");
    expect(context.settingUp).not.to.be.ok;
    expect(context.admin instanceof Admin).to.be.ok;
    expect(context.admin.isSystemAdmin()).to.be.ok;
    expect(context.admin.email).to.equal("email");
  });

  it("renders child", () => {
    let children = wrapper.find(FakeChild);
    expect(children.length).to.equal(1);
  });

  it("should pass down the pathFor function down to the child as context", () => {
    const hasAccess = "has access to pathFor context";
    let pathForStub = stub();
    class MockContextProvider extends ContextProvider {
      constructor(props) {
        super(props);
        this.pathFor = pathForStub;
      }
    }

    class Child extends React.Component<{}, {}> {
      static contextTypes = {
        pathFor: PropTypes.func.isRequired
      };
      render() {
        const hasContext = this.context?.pathFor === pathForStub;
        return (
          <div>
            {hasContext ? hasAccess : "doesn't have access to context"}
          </div>
        );
      }
    }

    let mockProvider = mount(
      <MockContextProvider csrfToken="token">
        <Child />
      </MockContextProvider>
    );

    expect(mockProvider.text()).to.equal(hasAccess);
  });

  describe("class methods", () => {
    let collectionUrl = "collection/url";
    let bookUrl = "book/url";
    let tab = "tab";

    describe("prepareCollectionUrl", () => {
      it("prepares collection url", () => {
        let host = "http://example.com";
        (jsdom as any).changeURL(window, host + "/test");
        let url = host + "/groups/eng/Adult%20Fiction";
        expect(instance.prepareCollectionUrl(url)).to.equal("groups%2Feng%2FAdult%2520Fiction");
      });
    });

    describe("prepareBookUrl", () => {
      it("prepares book url", () => {
        let host = "http://example.com";
        (jsdom as any).changeURL(window, host + "/test");
        let url = host + "/library/works/Axis%20360/Axis%20360%20ID/0016201449";
        expect(instance.prepareBookUrl(url)).to.equal("library%2FAxis%2520360%2FAxis%2520360%2520ID%2F0016201449");
      });
    });

    describe("pathFor", () => {
      it("returns a path with collection, book, and tab", () => {
        let path = pathFor(collectionUrl, bookUrl, tab);
        expect(path).to.equal(
          `/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
          `/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`
        );
      });

      it("returns a path with collection and book", () => {
        let path = pathFor(collectionUrl, bookUrl, null);
        expect(path).to.equal(
          `/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
          `/book/${instance.prepareBookUrl(bookUrl)}`
        );
      });

      it("returns a path with only collection", () => {
        let path = pathFor(collectionUrl, null, null);
        expect(path).to.equal(`/admin/web/collection/${instance.prepareCollectionUrl(collectionUrl)}`);
      });

      it("returns a path with only book", () => {
        let path = pathFor(null, bookUrl, null);
        expect(path).to.equal(`/admin/web/book/${instance.prepareBookUrl(bookUrl)}`);
      });

      it("returns a path with book and tab", () => {
        let path = pathFor(null, bookUrl, tab);
        expect(path).to.equal(`/admin/web/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`);
      });

      it("returns a path with no collection, book, or tab", () => {
        let path = pathFor(null, null, null);
        expect(path).to.equal(`/admin/web`);
      });
    });
  });
});
