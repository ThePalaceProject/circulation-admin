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
    const { queryByRole } = render(
      <RouterContextProvider>
        <EntryPointsTabs />
      </RouterContextProvider>
    );
    expect(
      queryByRole("group", { name: "Format filters" })
    ).not.toBeInTheDocument();
  });

  it("renders two tabs for two entry points", () => {
    const { container, getByRole } = render(
      <RouterContextProvider>
        <EntryPointsTabs facets={facets} />
      </RouterContextProvider>
    );
    const filterGroup = getByRole("group", { name: "Format filters" });
    expect(filterGroup).toBeInTheDocument();

    const filters = container.querySelectorAll("a.entry-points-filter");
    expect(filters).toHaveLength(2);
    expect(filters[0].className).toContain("entry-points-filter--active");
    expect(filters[1].className).not.toContain("entry-points-filter--active");
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
    const filter = container.querySelector("a.entry-points-filter");
    expect(filter).toBeInTheDocument();
    expect(filter.className).toContain("entry-points-filter--active");
    expect(filter.textContent).toContain("Audiobooks");
  });
});
