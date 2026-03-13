import * as React from "react";
import * as PropTypes from "prop-types";
import { render } from "@testing-library/react";
import ContextProvider from "../../../src/components/layout/ContextProvider";
import Admin from "../../../src/models/Admin";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";
import { ConfigurationSettings } from "../../../src/interfaces";

const baseConfig: Partial<ConfigurationSettings> = {
  csrfToken: "token",
  featureFlags: defaultFeatureFlags,
  roles: [{ role: "system" }],
  email: "email",
};

function renderProvider(
  config: Partial<ConfigurationSettings> = baseConfig,
  children: React.ReactNode = <div data-testid="child" />
) {
  return render(<ContextProvider config={config}>{children}</ContextProvider>);
}

function getContextProvider(
  config: Partial<ConfigurationSettings> = baseConfig
): ContextProvider {
  const ref = React.createRef<ContextProvider>();
  render(
    <ContextProvider ref={ref} config={config}>
      <div />
    </ContextProvider>
  );
  return ref.current!;
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("ContextProvider rendering", () => {
  it("renders its child", () => {
    const { getByTestId } = renderProvider();
    expect(getByTestId("child")).toBeTruthy();
  });

  it("passes pathFor through context to descendants", () => {
    const pathForStub = jest.fn();

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
          <div>
            {hasContext ? "has access to pathFor context" : "no context"}
          </div>
        );
      }
    }

    const { container } = render(
      <MockContextProvider config={{ csrfToken: "token", featureFlags: {} }}>
        <Child />
      </MockContextProvider>
    );
    expect(container.textContent).toBe("has access to pathFor context");
  });

  it("saves the enableAutoList feature flag to the store", () => {
    const config: Partial<ConfigurationSettings> = {
      csrfToken: "token",
      featureFlags: { enableAutoList: true },
    };
    const instance = getContextProvider(config);
    const state = instance.store.getState();
    expect(state.editor.customListEditor.isAutoUpdateEnabled).toBe(true);
  });
});

// ── child context ─────────────────────────────────────────────────────────────

describe("ContextProvider getChildContext", () => {
  it("has editorStore with editor and catalog state", () => {
    const instance = getContextProvider();
    const ctx = instance.getChildContext();
    expect(ctx.editorStore.getState().editor).toBeTruthy();
    expect(ctx.editorStore.getState().catalog).toBeTruthy();
  });

  it("returns csrfToken", () => {
    const instance = getContextProvider();
    const ctx = instance.getChildContext();
    expect(ctx.csrfToken).toBe("token");
  });

  it("settingUp is falsy by default", () => {
    const instance = getContextProvider();
    const ctx = instance.getChildContext();
    expect(ctx.settingUp).toBeFalsy();
  });

  it("admin is an Admin instance that is system admin", () => {
    const instance = getContextProvider();
    const ctx = instance.getChildContext();
    expect(ctx.admin instanceof Admin).toBe(true);
    expect(ctx.admin.isSystemAdmin()).toBe(true);
  });

  it("admin has the configured email", () => {
    const instance = getContextProvider();
    const ctx = instance.getChildContext();
    expect(ctx.admin.email).toBe("email");
  });
});

// ── prepareCollectionUrl / prepareBookUrl ────────────────────────────────────

describe("ContextProvider URL helpers", () => {
  const host = "http://localhost";

  beforeEach(() => {
    // Set jsdom URL to the test host
    Object.defineProperty(window, "location", {
      value: new URL(host + "/test"),
      writable: true,
    });
  });

  it("prepareCollectionUrl encodes and strips origin prefix", () => {
    const instance = getContextProvider();
    const url = host + "/groups/eng/Adult%20Fiction";
    expect(instance.prepareCollectionUrl(url)).toBe(
      "groups%2Feng%2FAdult%2520Fiction"
    );
  });

  it("prepareBookUrl encodes library/work path", () => {
    const instance = getContextProvider();
    const url = host + "/library/works/Axis%20360/Axis%20360%20ID/0016201449";
    expect(instance.prepareBookUrl(url)).toBe(
      "library%2FAxis%2520360%2FAxis%2520360%2520ID%2F0016201449"
    );
  });
});

// ── pathFor ───────────────────────────────────────────────────────────────────

describe("ContextProvider pathFor", () => {
  const collectionUrl = "collection/url";
  const bookUrl = "book/url";
  const tab = "tab";

  let instance: ContextProvider;

  beforeEach(() => {
    instance = getContextProvider();
  });

  it("returns path with collection, book, and tab", () => {
    const path = instance.pathFor(collectionUrl, bookUrl, tab);
    const expectedCollection = instance.prepareCollectionUrl(collectionUrl);
    const expectedBook = instance.prepareBookUrl(bookUrl);
    expect(path).toBe(
      `/admin/web/collection/${expectedCollection}/book/${expectedBook}/tab/${tab}`
    );
  });

  it("returns path with collection and book (no tab)", () => {
    const path = instance.pathFor(collectionUrl, bookUrl, null);
    const expectedCollection = instance.prepareCollectionUrl(collectionUrl);
    const expectedBook = instance.prepareBookUrl(bookUrl);
    expect(path).toBe(
      `/admin/web/collection/${expectedCollection}/book/${expectedBook}`
    );
  });

  it("returns path with only collection", () => {
    const path = instance.pathFor(collectionUrl, null, null);
    const expectedCollection = instance.prepareCollectionUrl(collectionUrl);
    expect(path).toBe(`/admin/web/collection/${expectedCollection}`);
  });

  it("returns path with only book", () => {
    const path = instance.pathFor(null, bookUrl, null);
    const expectedBook = instance.prepareBookUrl(bookUrl);
    expect(path).toBe(`/admin/web/book/${expectedBook}`);
  });

  it("returns path with book and tab", () => {
    const path = instance.pathFor(null, bookUrl, tab);
    const expectedBook = instance.prepareBookUrl(bookUrl);
    expect(path).toBe(`/admin/web/book/${expectedBook}/tab/${tab}`);
  });

  it("returns base path when no collection, book, or tab", () => {
    const path = instance.pathFor(null, null, null);
    expect(path).toBe("/admin/web");
  });
});
