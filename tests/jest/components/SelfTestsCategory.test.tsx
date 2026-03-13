import * as React from "react";
import { render, screen } from "@testing-library/react";

import buildStore from "../../../src/store";
import SelfTestsCategory from "../../../src/components/config/SelfTestsCategory";

// SelfTests is a connected component (needs Redux + RTK Query).
// Mock it to focus tests on SelfTestsCategory's own logic.
jest.mock("../../../src/components/config/SelfTests", () => {
  return function SelfTestsMock(props: { item: { name: string } }) {
    return (
      <div
        data-testid="self-tests"
        data-item-name={props.item?.name}
        data-type={(props as any).type}
        data-sort-by-collection={String((props as any).sortByCollection)}
      />
    );
  };
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const collections = [
  {
    id: 1,
    name: "collection with success",
    protocol: "protocol",
    self_test_results: {
      duration: 1.75,
      start: "2018-08-07T19:34:54Z",
      end: "2018-08-07T19:34:55Z",
      results: [
        {
          duration: 0.000119,
          end: "2018-08-07T19:34:54Z",
          exception: null,
          name: "Initial setup.",
          result: null,
          start: "2018-08-07T19:34:54Z",
          success: true,
        },
      ],
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
        {
          duration: 0.000119,
          end: "2018-08-07T19:34:54Z",
          exception: null,
          name: "Initial setup.",
          result: null,
          start: "2018-08-07T19:34:54Z",
          success: true,
        },
        {
          duration: 0,
          end: "2018-08-07T19:34:55Z",
          exception: {
            class: "IntegrationException",
            debug_message: "Add to a library.",
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

function renderCategory(
  overrides: Partial<React.ComponentProps<typeof SelfTestsCategory>> = {}
) {
  const store = buildStore();
  return render(
    <SelfTestsCategory
      type="collection"
      linkName="collections"
      csrfToken="token"
      items={collections as any}
      store={store}
      {...overrides}
    />
  );
}

describe("SelfTestsCategory", () => {
  // ─── Structure ───────────────────────────────────────────────────────────────

  it("renders .self-tests-category.has-additional-content", () => {
    renderCategory();
    const container = document.querySelector(".self-tests-category");
    expect(container).toBeInTheDocument();
    expect(container.classList.contains("has-additional-content")).toBe(true);
  });

  it("renders a panel for each item", () => {
    renderCategory();
    // Each collection name should appear as a panel header
    expect(screen.getByText("collection with success")).toBeInTheDocument();
    expect(screen.getByText("collection with failure")).toBeInTheDocument();
    expect(screen.getByText("collection with no results")).toBeInTheDocument();
  });

  it("renders a SelfTests component for each item", () => {
    renderCategory();
    const selfTestsMocks = screen.getAllByTestId("self-tests");
    expect(selfTestsMocks).toHaveLength(3);
    expect(selfTestsMocks[0].dataset.itemName).toBe("collection with success");
    expect(selfTestsMocks[1].dataset.itemName).toBe("collection with failure");
    expect(selfTestsMocks[2].dataset.itemName).toBe(
      "collection with no results"
    );
  });

  // ─── Color coding ─────────────────────────────────────────────────────────────

  it("applies success style to a panel when all results pass", () => {
    renderCategory();
    // The Panel for "collection with success" uses Bootstrap panel-success
    const successPanel = document
      .querySelector("[id='collectionwithsuccess-1']")
      ?.closest(".panel-success, [class*='success']");
    // The panel's style class is a sibling or ancestor — check via panel-success CSS class
    const panels = document.querySelectorAll(".panel-success");
    expect(panels.length).toBeGreaterThanOrEqual(1);
  });

  it("applies danger style to a panel when any result fails", () => {
    renderCategory();
    const panels = document.querySelectorAll(".panel-danger");
    expect(panels.length).toBeGreaterThanOrEqual(1);
  });

  it("applies default style to a panel when there are no results", () => {
    renderCategory();
    const panels = document.querySelectorAll(".panel-default");
    expect(panels.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Single item ──────────────────────────────────────────────────────────────

  it("opens the panel by default when there is only one item", () => {
    const store = buildStore();
    render(
      <SelfTestsCategory
        type="collection"
        linkName="collections"
        csrfToken="token"
        items={[collections[0]] as any}
        store={store}
      />
    );
    // With only one item, expanded panel content should be visible
    const panelBody = document.querySelector(".panel-body");
    expect(panelBody).not.toHaveStyle("display: none");
  });

  it("does not open panels by default when there are multiple items", () => {
    renderCategory();
    const panelBodies = document.querySelectorAll(".panel-body");
    // All panels should be initially collapsed (display: none)
    const allHidden = Array.from(panelBodies).every(
      (p) => (p as HTMLElement).style.display === "none"
    );
    expect(allHidden).toBe(true);
  });

  // ─── Unnamed items ────────────────────────────────────────────────────────────

  it("assigns 'Unnamed collection' as a name for items with null names", () => {
    const store = buildStore();
    const namelessItem = {
      id: 1,
      name: null,
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [
          {
            duration: 0.000119,
            end: "2018-08-07T19:34:54Z",
            exception: null,
            name: "Initial setup.",
            result: null,
            start: "2018-08-07T19:34:54Z",
            success: true,
          },
        ],
      },
    };
    render(
      <SelfTestsCategory
        type="collection"
        linkName="collections"
        csrfToken="token"
        items={[namelessItem] as any}
        store={store}
      />
    );
    expect(screen.getByText("Unnamed collection")).toBeInTheDocument();
  });

  // ─── sortByCollection ─────────────────────────────────────────────────────────

  it("passes sortByCollection=false when results have no collection property", () => {
    renderCategory();
    const mocks = screen.getAllByTestId("self-tests");
    expect(mocks[0].dataset.sortByCollection).toBe("false");
  });

  it("passes sortByCollection=true when any result has a collection property", () => {
    const store = buildStore();
    const withCollectionResult = {
      ...collections[0],
      self_test_results: {
        ...collections[0].self_test_results,
        results: [
          { ...collections[0].self_test_results.results[0], collection: "lib" },
        ],
      },
    };
    render(
      <SelfTestsCategory
        type="collection"
        linkName="collections"
        csrfToken="token"
        items={[withCollectionResult] as any}
        store={store}
      />
    );
    const mock = screen.getByTestId("self-tests");
    expect(mock.dataset.sortByCollection).toBe("true");
  });
});
