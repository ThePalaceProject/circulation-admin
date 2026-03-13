import * as React from "react";
import * as PropTypes from "prop-types";
import { render, fireEvent } from "@testing-library/react";
import {
  TabContainer,
  TabContainerProps,
} from "../../../src/components/shared/TabContainer";
import buildStore from "../../../src/store";

const store = buildStore();

// TabContainer needs router + pathFor via legacy context
class RouterContextProvider extends React.Component<{
  children: React.ReactNode;
}> {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };
  getChildContext() {
    return {
      router: { push: jest.fn(), createHref: () => "test href" },
      pathFor: (collectionUrl: string, bookUrl: string) =>
        `${collectionUrl}::${bookUrl}`,
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

// Concrete implementation for testing
const handleSelectFn = jest.fn();

class MockTabContainer extends TabContainer<TabContainerProps> {
  handleSelect(event) {
    handleSelectFn(event);
  }
  tabs() {
    return {
      tab1: <div className="tab1" />,
      tab2: <div className="tab2" />,
    };
  }
}

function renderMockTabs(tab: string | null = null) {
  return render(
    <RouterContextProvider>
      <MockTabContainer tab={tab} csrfToken="token" store={store}>
        <div className="test-child">Moby Dick</div>
      </MockTabContainer>
    </RouterContextProvider>
  );
}

describe("TabContainer", () => {
  beforeEach(() => {
    handleSelectFn.mockClear();
  });

  it("shows nav tabs", () => {
    const { container } = renderMockTabs();
    const tabs = container.querySelector("ul.nav-tabs");
    const links = tabs.querySelectorAll("li");
    const texts = Array.from(links).map((l) => l.textContent);
    expect(texts).toContain("Tab1");
    expect(texts).toContain("Tab2");
    expect(links[0].className).toBe("active");
    expect(links[1].className).toBeFalsy();
  });

  it("shows default tab content (tab1 visible, tab2 hidden)", () => {
    const { container } = renderMockTabs();
    const tab1Wrapper = container.querySelector("div#tab1");
    const tab2Wrapper = container.querySelector("div#tab2");
    expect((tab1Wrapper as HTMLElement).style.display).toBe("block");
    expect((tab2Wrapper as HTMLElement).style.display).toBe("none");
  });

  it("shows tab content from tab in props", () => {
    const { container } = renderMockTabs("tab2");
    const tab1Wrapper = container.querySelector("div#tab1");
    const tab2Wrapper = container.querySelector("div#tab2");
    expect((tab1Wrapper as HTMLElement).style.display).toBe("none");
    expect((tab2Wrapper as HTMLElement).style.display).toBe("block");
  });

  it("calls handleSelect when tab link is clicked", () => {
    const { container } = renderMockTabs();
    const links = container.querySelectorAll("ul.nav-tabs a");
    fireEvent.click(links[1]);
    expect(handleSelectFn).toHaveBeenCalledTimes(1);
  });
});
