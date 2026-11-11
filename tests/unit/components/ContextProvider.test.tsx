import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen } from "@testing-library/react";

import ContextProvider from "../../../src/components/ContextProvider";
import Admin from "../../../src/models/Admin";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import { ConfigurationSettings } from "../../../src/interfaces";

// Reads everything ContextProvider puts on the legacy React context — the real
// contract the app's pages consume — so we can assert on it without reaching for
// the component instance.
let captured: any;
class Capture extends React.Component {
  static contextTypes = {
    editorStore: PropTypes.object,
    csrfToken: PropTypes.string,
    settingUp: PropTypes.bool,
    admin: PropTypes.object,
    featureFlags: PropTypes.object,
    pathFor: PropTypes.func,
  };
  render() {
    captured = this.context;
    return <div>child rendered</div>;
  }
}

const renderWithConfig = (config: Partial<ConfigurationSettings>) =>
  render(
    <ContextProvider config={config as ConfigurationSettings}>
      <Capture />
    </ContextProvider>
  );

describe("ContextProvider", () => {
  beforeEach(() => {
    captured = undefined;
  });

  it("provides child context", () => {
    renderWithConfig({
      csrfToken: "token",
      featureFlags: defaultFeatureFlags,
      roles: [{ role: "system" }],
      email: "email",
    });

    expect(captured.editorStore.getState().editor).toBeTruthy();
    expect(captured.editorStore.getState().catalog).toBeTruthy();
    expect(captured.csrfToken).toBe("token");
    expect(captured.settingUp).toBeFalsy();
    expect(captured.admin instanceof Admin).toBe(true);
    expect(captured.admin.isSystemAdmin()).toBe(true);
    expect(captured.admin.email).toBe("email");
  });

  it("saves the enableAutoList feature flag to the store", () => {
    renderWithConfig({
      csrfToken: "token",
      featureFlags: { enableAutoList: true },
    });

    expect(
      captured.editorStore.getState().editor.customListEditor
        .isAutoUpdateEnabled
    ).toBe(true);
  });

  it("renders its child", () => {
    renderWithConfig({ csrfToken: "token", featureFlags: {} });
    expect(screen.getByText("child rendered")).toBeInTheDocument();
  });

  it("passes pathFor down through context", () => {
    renderWithConfig({ csrfToken: "token", featureFlags: {} });
    expect(typeof captured.pathFor).toBe("function");
  });

  describe("pathFor", () => {
    // prepareCollectionUrl / prepareBookUrl strip only `document.location.origin`,
    // so using the real jsdom origin as the host yields the same encoded output the
    // legacy test asserted (it forced the origin to example.com via jsdom.reconfigure,
    // which the unit test environment does not provide). These calls also exercise
    // prepareCollectionUrl and prepareBookUrl transitively.
    const host = window.location.origin;
    const collectionUrl = `${host}/groups/eng/Adult%20Fiction`;
    const bookUrl = `${host}/library/works/Axis%20360/Axis%20360%20ID/0016201449`;
    const preparedCollection = "groups%2Feng%2FAdult%2520Fiction";
    const preparedBook =
      "library%2FAxis%2520360%2FAxis%2520360%2520ID%2F0016201449";

    beforeEach(() => {
      renderWithConfig({ csrfToken: "token", featureFlags: {} });
    });

    it("returns a path with collection, book, and tab", () => {
      expect(captured.pathFor(collectionUrl, bookUrl, "tab")).toBe(
        `/admin/web/collection/${preparedCollection}/book/${preparedBook}/tab/tab`
      );
    });

    it("returns a path with collection and book", () => {
      expect(captured.pathFor(collectionUrl, bookUrl, null)).toBe(
        `/admin/web/collection/${preparedCollection}/book/${preparedBook}`
      );
    });

    it("returns a path with only a collection", () => {
      expect(captured.pathFor(collectionUrl, null, null)).toBe(
        `/admin/web/collection/${preparedCollection}`
      );
    });

    it("returns a path with only a book", () => {
      expect(captured.pathFor(null, bookUrl, null)).toBe(
        `/admin/web/book/${preparedBook}`
      );
    });

    it("returns a path with a book and tab", () => {
      expect(captured.pathFor(null, bookUrl, "tab")).toBe(
        `/admin/web/book/${preparedBook}/tab/tab`
      );
    });

    it("returns the base path with no collection, book, or tab", () => {
      expect(captured.pathFor(null, null, null)).toBe("/admin/web");
    });

    it("leaves a book url unchanged when it does not match the works pattern", () => {
      // prepareBookUrl returns the url as-is when the /works/ regexp misses.
      expect(captured.pathFor(null, "not-a-works-url", null)).toBe(
        "/admin/web/book/not-a-works-url"
      );
    });
  });
});
