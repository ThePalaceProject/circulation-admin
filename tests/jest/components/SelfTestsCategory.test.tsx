import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";

// `SelfTests` is a connected component that fetches self-test results on mount.
// It is incidental to what `SelfTestsCategory` itself does (build one panel per
// item, color-code them, decide `openByDefault`, and compute `sortByCollection`),
// so mock it to a marker that exposes the props the category passes down.
jest.mock("../../../src/components/SelfTests", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="self-tests"
      data-type={props.type}
      data-item-id={props.item?.id}
      data-item-name={props.item?.name}
      data-sort-by-collection={String(props.sortByCollection)}
    />
  ),
}));

import SelfTestsCategory from "../../../src/components/SelfTestsCategory";

const initialSetupResult = {
  duration: 0.000119,
  end: "2018-08-07T19:34:54Z",
  exception: null,
  name: "Initial setup.",
  result: null,
  start: "2018-08-07T19:34:54Z",
  success: true,
};

const collections: any[] = [
  {
    id: 1,
    name: "collection with success",
    protocol: "protocol",
    self_test_results: {
      duration: 1.75,
      start: "2018-08-07T19:34:54Z",
      end: "2018-08-07T19:34:55Z",
      results: [initialSetupResult],
    },
  },
  {
    id: 2,
    name: "collection with failure",
    protocol: "protocol",
    self_test_results: {
      duration: 1.75,
      start: "2018-08-07T19:34:54Z",
      end: "2018-08-07T19:34:55Z",
      results: [
        initialSetupResult,
        {
          duration: 0,
          end: "2018-08-07T19:34:55Z",
          exception: {
            class: "IntegrationException",
            debug_message:
              "Add the collection to a library that has a patron authentication service.",
            message: "Collection is not associated with any libraries.",
          },
          name: "Acquiring test patron credentials.",
          result: null,
          start: "2018-08-07T19:34:55Z",
          success: false,
        },
      ],
    },
  },
  {
    id: 3,
    name: "collection with no results",
    protocol: "protocol",
  },
];

const renderCategory = (items: any[] = collections) =>
  renderWithProviders(
    <SelfTestsCategory
      type="collection"
      linkName="collections"
      csrfToken="token"
      items={items}
      store={buildStore()}
    />
  );

describe("SelfTestsCategory", () => {
  it("renders a list of items", () => {
    const { container } = renderCategory();

    const root = container.querySelector(".self-tests-category");
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("has-additional-content");

    const titles = Array.from(
      container.querySelectorAll("ul .panel-title")
    ).map((el) => el.textContent);
    expect(titles).toStrictEqual([
      "collection with success",
      "collection with failure",
      "collection with no results",
    ]);

    // One SelfTests per item, each carrying the category's type and its item.
    const selfTests = screen.getAllByTestId("self-tests");
    expect(selfTests).toHaveLength(3);
    selfTests.forEach((el, idx) => {
      expect(el).toHaveAttribute("data-type", "collection");
      expect(el).toHaveAttribute("data-item-id", String(collections[idx].id));
    });
  });

  it("color-codes", () => {
    const { container } = renderCategory();
    const panels = container.querySelectorAll(".panel");
    expect(panels[0]).toHaveClass("panel-success");
    expect(panels[1]).toHaveClass("panel-danger");
    expect(panels[2]).toHaveClass("panel-default");
  });

  it("opens the panel by default if there's only one", () => {
    // With multiple items, none are open by default.
    const multi = renderCategory();
    expect(
      Array.from(multi.container.querySelectorAll(".panel-heading")).some(
        (h) => h.getAttribute("aria-expanded") === "true"
      )
    ).toBe(false);
    multi.unmount();

    // A fresh render with a single item opens that panel by default.
    // (`openByDefault` seeds the panel's initial state, so a new mount is needed.)
    const single = renderCategory([collections[0]]);
    const singleHeaders = single.container.querySelectorAll(".panel-heading");
    expect(singleHeaders).toHaveLength(1);
    expect(singleHeaders[0]).toHaveAttribute("aria-expanded", "true");
  });

  it("passes the sortByCollection prop to SelfTests", () => {
    const { rerender } = renderCategory();
    expect(screen.getAllByTestId("self-tests")[0]).toHaveAttribute(
      "data-sort-by-collection",
      "false"
    );

    const withCollection = {
      id: 99,
      name: "collection with sorting",
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [{ ...initialSetupResult, collection: "sort!" }],
      },
    };

    rerender(
      <SelfTestsCategory
        type="collection"
        linkName="collections"
        csrfToken="token"
        items={[withCollection, ...collections]}
        store={buildStore()}
      />
    );

    expect(screen.getAllByTestId("self-tests")[0]).toHaveAttribute(
      "data-sort-by-collection",
      "true"
    );
  });

  it("handles unnamed items", () => {
    const nameless: any = {
      id: 1,
      name: null,
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [initialSetupResult],
      },
    };
    const { container } = renderCategory([nameless]);

    expect(screen.getByText("Unnamed collection")).toHaveClass("panel-title");
    // Panel id becomes `${name-without-spaces}-${id}`; its body id appends "-panel".
    expect(
      container.querySelector("#Unnamedcollection-1-panel")
    ).toBeInTheDocument();
  });
});
