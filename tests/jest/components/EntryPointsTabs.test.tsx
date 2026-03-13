import * as React from "react";
import * as PropTypes from "prop-types";
import { render } from "@testing-library/react";
import { EntryPointsTabs } from "../../../src/components/shared/EntryPointsTabs";

// EntryPointsTabs needs router + pathFor via legacy context
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

const facets = [
  {
    label: "Ebooks",
    href: "http://circulation.librarysimplified.org/groups/?entrypoint=Book",
    active: true,
  },
  {
    label: "Audiobooks",
    href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
    active: false,
  },
];

describe("EntryPointsTabs", () => {
  it("renders nothing when no facets", () => {
    const { container } = render(
      <RouterContextProvider>
        <EntryPointsTabs />
      </RouterContextProvider>
    );
    expect(container.querySelector(".nav-tabs")).not.toBeInTheDocument();
  });

  it("renders two tabs for two entry points", () => {
    const { container } = render(
      <RouterContextProvider>
        <EntryPointsTabs facets={facets} />
      </RouterContextProvider>
    );
    const ul = container.querySelector("ul.nav-tabs");
    expect(ul).toBeInTheDocument();
    const items = ul.querySelectorAll("li");
    expect(items).toHaveLength(2);
    // First facet is active
    expect(items[0].className).toContain("active");
    // Second facet is not active
    expect(items[1].className).not.toMatch(/\bactive\b/);
  });

  it("renders one tab with active class for single active facet", () => {
    const singleFacet = [
      {
        label: "Audiobooks",
        href:
          "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
        active: true,
      },
    ];
    const { container } = render(
      <RouterContextProvider>
        <EntryPointsTabs facets={singleFacet} />
      </RouterContextProvider>
    );
    const items = container.querySelectorAll("ul.nav-tabs li");
    expect(items).toHaveLength(1);
    expect(items[0].className).toContain("active");
    expect(items[0].textContent).toContain("Audiobooks");
  });
});
