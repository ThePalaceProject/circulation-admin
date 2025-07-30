import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ContextProvider from "../ContextProvider";
import Admin from "../../models/Admin";
import * as PropTypes from "prop-types";
import { stub } from "sinon";
import { defaultFeatureFlags } from "../../utils/featureFlags";
import { ConfigurationSettings } from "../../interfaces";

class FakeChild extends React.Component<object> {}

describe("ContextProvider", () => {
  let wrapper;
  let instance;
  let pathFor;

  beforeEach(() => {
    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "token",
      featureFlags: defaultFeatureFlags,
      roles: [{ role: "system" }],
      email: "email",
    };
    wrapper = shallow(
      <ContextProvider config={appConfigSettings}>
        <FakeChild />
      </ContextProvider>
    );
    instance = wrapper.instance();
    pathFor = instance.pathFor;
  });

  it("provides child context", () => {
    const context = instance.getChildContext();
    expect(context.editorStore.getState().editor).to.be.ok;
    expect(context.editorStore.getState().catalog).to.be.ok;
    expect(context.csrfToken).to.equal("token");
    expect(context.settingUp).not.to.be.ok;
    expect(context.admin instanceof Admin).to.be.ok;
    expect(context.admin.isSystemAdmin()).to.be.ok;
    expect(context.admin.email).to.equal("email");
  });

  it("saves the enableAutoList feature flag to the store", () => {
    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "token",
      featureFlags: { enableAutoList: true },
    };
    wrapper = shallow(
      <ContextProvider config={appConfigSettings}>
        <FakeChild />
      </ContextProvider>
    );

    instance = wrapper.instance();

    const context = instance.getChildContext();

    expect(
      context.editorStore.getState().editor.customListEditor.isAutoUpdateEnabled
    ).to.equal(true);
  });

  it("renders child", () => {
    const children = wrapper.find(FakeChild);
    expect(children.length).to.equal(1);
  });

  it("should pass down the pathFor function down to the child as context", () => {
    const hasAccess = "has access to pathFor context";
    const pathForStub = stub();
    class MockContextProvider extends ContextProvider {
      constructor(props) {
        super(props);
        this.pathFor = pathForStub;
      }
    }

    class Child extends React.Component<object> {
      static contextTypes = {
        pathFor: PropTypes.func.isRequired,
      };
      render() {
        const hasContext = this.context && this.context.pathFor === pathForStub;
        return (
          <div>{hasContext ? hasAccess : "doesn't have access to context"}</div>
        );
      }
    }

    const appConfigSettings: Partial<ConfigurationSettings> = {
      csrfToken: "token",
      featureFlags: {},
    };
    const mockProvider = mount(
      <MockContextProvider config={appConfigSettings}>
        <Child />
      </MockContextProvider>
    );

    expect(mockProvider.text()).to.equal(hasAccess);
  });

  describe("class methods", () => {
    const collectionUrl = "collection/url";
    const bookUrl = "book/url";
    const tab = "tab";

    describe("prepareCollectionUrl", () => {
      it("prepares collection url", () => {
        const host = "http://example.com";
        global.jsdom.reconfigure({ url: host + "/test" });
        const url = host + "/groups/eng/Adult%20Fiction";
        expect(instance.prepareCollectionUrl(url)).to.equal(
          "groups%2Feng%2FAdult%2520Fiction"
        );
      });
    });

    describe("prepareBookUrl", () => {
      it("prepares book url", () => {
        const host = "http://example.com";
        global.jsdom.reconfigure({ url: host + "/test" });
        const url =
          host + "/library/works/Axis%20360/Axis%20360%20ID/0016201449";
        expect(instance.prepareBookUrl(url)).to.equal(
          "library%2FAxis%2520360%2FAxis%2520360%2520ID%2F0016201449"
        );
      });
    });

    describe("pathFor", () => {
      it("returns a path with collection, book, and tab", () => {
        const path = pathFor(collectionUrl, bookUrl, tab);
        expect(path).to.equal(
          `/admin/web/collection/${instance.prepareCollectionUrl(
            collectionUrl
          )}` + `/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`
        );
      });

      it("returns a path with collection and book", () => {
        const path = pathFor(collectionUrl, bookUrl, null);
        expect(path).to.equal(
          `/admin/web/collection/${instance.prepareCollectionUrl(
            collectionUrl
          )}` + `/book/${instance.prepareBookUrl(bookUrl)}`
        );
      });

      it("returns a path with only collection", () => {
        const path = pathFor(collectionUrl, null, null);
        expect(path).to.equal(
          `/admin/web/collection/${instance.prepareCollectionUrl(
            collectionUrl
          )}`
        );
      });

      it("returns a path with only book", () => {
        const path = pathFor(null, bookUrl, null);
        expect(path).to.equal(
          `/admin/web/book/${instance.prepareBookUrl(bookUrl)}`
        );
      });

      it("returns a path with book and tab", () => {
        const path = pathFor(null, bookUrl, tab);
        expect(path).to.equal(
          `/admin/web/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`
        );
      });

      it("returns a path with no collection, book, or tab", () => {
        const path = pathFor(null, null, null);
        expect(path).to.equal(`/admin/web`);
      });
    });
  });
});
