import * as React from "react";
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
// The default export is the connected component. Rendering it (rather than the
// unconnected `SelfTests` class) exercises `mapStateToProps` /
// `mapDispatchToProps`, whose wiring nothing else covers.
import SelfTests from "../../../src/components/SelfTests";

// SelfTests can take more than just a collection (an integration can have self
// tests), but we only exercise collection data here.
const collections: any[] = [
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
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
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
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
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
    self_test_results: {
      exception: "Exception getting self-test results for collection ...",
      duration: 0,
      start: "",
      end: "",
      results: [],
    },
  },
];

const updatedCollection = {
  id: 1,
  name: "collection 1",
  protocol: "protocol",
  libraries: [{ short_name: "library" }],
  settings: {
    external_account_id: "nypl",
  },
  self_test_results: {
    duration: 1.75,
    start: "2018-08-07T20:34:54Z",
    end: "2018-08-07T20:34:55Z",
    results: [
      {
        duration: 0.000119,
        end: "2018-08-07T20:34:54Z",
        exception: null,
        name: "Initial setup.",
        result: null,
        start: "2018-08-07T20:34:54Z",
        success: true,
      },
    ],
  },
};

// Match the component's own date formatting (local time, matching `formatDate`).
const getExpectedDate = (date: Date): string => date.toDateString();
const getExpectedTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// The `GET_SELF_TESTS` response body. Its `self_test_results.id` never matches a
// seeded collection/patron-auth id, so the shared `hasSelfTests` load reducer
// leaves the seeded data intact (and `mapStateToProps` keeps passing
// `ownProps.item` through, since the body carries no matching `goal`).
const getSelfTestsResponse = () =>
  new Response(JSON.stringify({ self_test_results: { id: 0 } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("SelfTests", () => {
  let fetchSpy: jest.SpyInstance;

  // The connected component fetches self-test results on mount and posts to run
  // them. Stub `fetch` so nothing hits the network and no promise rejects after
  // teardown (which would crash the worker).
  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, "fetch").mockImplementation(((
      _url: string,
      options: any
    ) => {
      if (options && options.method === "POST") {
        return Promise.resolve(new Response("", { status: 200 }));
      }
      return Promise.resolve(getSelfTestsResponse());
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Each test gets a fresh store so the on-mount fetch does not leak state.
  const renderSelfTests = (
    props: Record<string, unknown>
  ): { store: ReturnType<typeof buildStore> } & ReturnType<
    typeof renderWithProviders
  > => {
    const store = buildStore();
    // `GET_SELF_TESTS_LOAD` is also handled by the `collections` and
    // `patronAuthServices` reducers (see `hasSelfTests`), which read `state.data`
    // and throw when it is null. Seed both with a non-empty list so the on-mount
    // fetch (and any re-fetch) resolves cleanly instead of rejecting and crashing
    // the worker.
    store.dispatch({
      type: "COLLECTIONS_LOAD",
      data: { collections: [{ id: 1 }] },
    });
    store.dispatch({
      type: "PATRON_AUTH_SERVICES_LOAD",
      data: { patron_auth_services: [{ id: 1 }] },
    });
    const utils = renderWithProviders(
      <SelfTests
        store={store}
        type="collection"
        csrfToken="token"
        sortByCollection={false}
        {...props}
      />,
      { reduxProviderProps: { store } }
    );
    return { store, ...utils };
  };

  // The on-mount `getSelfTests` GET resolves and writes `responseBody`; waiting
  // for it settles the fetch before the test ends.
  const settle = (store: ReturnType<typeof buildStore>) =>
    waitFor(() =>
      expect(store.getState().editor.selfTests.responseBody).not.toBeNull()
    );

  it("renders with empty self_test_results", async () => {
    const { store, container } = renderSelfTests({ item: {} });
    await settle(store);

    expect(
      container.querySelector(".integration-selftests")
    ).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeNull();
    expect(screen.getByText("No self test results found.")).toBeInTheDocument();
  });

  it("disables the Run tests button when the tests cannot be run", async () => {
    const item = {
      ...collections[0],
      self_test_results: {
        ...collections[0].self_test_results,
        exception: "Exception!",
        disabled: true,
      },
    };
    const { store } = renderSelfTests({ item });
    await settle(store);

    expect(screen.getByRole("button", { name: "Run tests" })).toBeDisabled();
  });

  it("renders the first-time message for new services", async () => {
    const exception = "This integration has no attribute 'prior_test_results'";
    const item = {
      ...collections[0],
      self_test_results: { ...collections[0].self_test_results, exception },
    };
    const { store, container } = renderSelfTests({ item });
    await settle(store);

    expect(
      container.querySelector(".integration-selftests")
    ).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeNull();
    expect(
      screen.getByText("There are no self test results yet.")
    ).toBeInTheDocument();
  });

  it("renders a results list when there are results", async () => {
    const { store, container } = renderSelfTests({ item: collections[0] });
    await settle(store);

    expect(
      container.querySelector(".integration-selftests")
    ).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("formats the date and duration of the most recent tests", async () => {
    const { store, container } = renderSelfTests({ item: collections[0] });
    await settle(store);

    const date = new Date(collections[0].self_test_results.start);
    expect(container.querySelector(".description")).toHaveTextContent(
      `Tests last ran on ${getExpectedDate(date)} ${getExpectedTime(
        date
      )} and lasted 1.75s.`
    );
  });

  it("swaps in freshly fetched results when they match the item (mapStateToProps)", async () => {
    // A fetched result for the same item, with a matching goal and a newer start
    // time, replaces the item in `mapStateToProps` (the connect wiring nothing
    // else covers).
    const item = {
      id: 42,
      name: "collection 42",
      protocol: "protocol",
      self_test_results: {
        duration: 1,
        start: "2018-08-07T10:00:00Z",
        end: "2018-08-07T10:00:01Z",
        results: [
          { name: "old result", success: true, result: null, exception: null },
        ],
      },
    };
    fetchSpy.mockImplementation(((_url: string, options: any) => {
      if (options && options.method === "POST") {
        return Promise.resolve(new Response("", { status: 200 }));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            self_test_results: {
              goal: "collection",
              id: 42,
              self_test_results: {
                duration: 2.5,
                start: "2018-08-07T23:00:00Z",
                end: "2018-08-07T23:00:01Z",
                results: [
                  {
                    name: "new result",
                    success: true,
                    result: null,
                    exception: null,
                  },
                ],
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    }) as any);

    const { container } = renderSelfTests({ item });

    // The fetched results supersede the originally-passed item.
    await waitFor(() =>
      expect(container.querySelector(".description")).toHaveTextContent(
        "and lasted 2.50s."
      )
    );
    expect(
      screen.getByRole("heading", { name: "new result" })
    ).toBeInTheDocument();
  });

  it("adopts a newer result but keeps the most recent one when an older result arrives", async () => {
    const { store, container, rerender } = renderSelfTests({
      item: collections[0],
    });
    await settle(store);

    const initialDate = new Date(collections[0].self_test_results.start);
    expect(container.querySelector(".description")).toHaveTextContent(
      getExpectedTime(initialDate)
    );

    // The new item has a more recent start time, so it becomes the most recent.
    rerender(
      <SelfTests
        store={store}
        type="collection"
        csrfToken="token"
        sortByCollection={false}
        item={updatedCollection}
      />
    );
    const newerDate = new Date(updatedCollection.self_test_results.start);
    expect(container.querySelector(".description")).toHaveTextContent(
      getExpectedTime(newerDate)
    );

    // This item is older, so the most recent result is unchanged.
    rerender(
      <SelfTests
        store={store}
        type="collection"
        csrfToken="token"
        sortByCollection={false}
        item={collections[1]}
      />
    );
    expect(container.querySelector(".description")).toHaveTextContent(
      getExpectedTime(newerDate)
    );
  });

  describe("Successful self tests", () => {
    it("shows a success icon and the summary for a passing collection", async () => {
      const { store, container } = renderSelfTests({ item: collections[0] });
      await settle(store);

      // There's only one self test result in the collection and it passes.
      expect(container.querySelector("svg.success")).toBeInTheDocument();
      expect(container.querySelector("svg.failure")).toBeNull();

      const date = new Date(collections[0].self_test_results.start);
      expect(container.querySelector(".description")).toHaveTextContent(
        `Tests last ran on ${getExpectedDate(date)} ${getExpectedTime(
          date
        )} and lasted 1.75s.`
      );
    });

    it("shows detail for each passing result", async () => {
      const { store, container } = renderSelfTests({ item: collections[0] });
      await settle(store);

      const items = container.querySelectorAll("ul li");
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveClass("success");
      expect(
        within(items[0] as HTMLElement).getByRole("heading", {
          name: "Initial setup.",
        })
      ).toBeInTheDocument();
      expect(items[0].querySelector(".success-description")).toHaveTextContent(
        "success: true"
      );
    });
  });

  describe("Unsuccessful self tests", () => {
    it("shows the base error message when results could not be retrieved", async () => {
      const { store, container } = renderSelfTests({ item: collections[2] });
      await settle(store);

      expect(container.querySelector(".description")).toHaveTextContent(
        "Exception getting self-test results for collection ..."
      );
    });

    it("shows a failure icon and summary when a test failed", async () => {
      const { store, container } = renderSelfTests({ item: collections[1] });
      await settle(store);

      // Two self tests ran but one failed, so a failing icon is shown.
      expect(container.querySelector("svg.failure")).toBeInTheDocument();
      expect(container.querySelector("svg.success")).toBeNull();

      const date = new Date(collections[1].self_test_results.start);
      expect(container.querySelector(".description")).toHaveTextContent(
        `Tests last ran on ${getExpectedDate(date)} ${getExpectedTime(
          date
        )} and lasted 1.75s.`
      );
    });

    it("shows detail for a mix of passing and failing results", async () => {
      const { store, container } = renderSelfTests({ item: collections[1] });
      await settle(store);

      const items = container.querySelectorAll("ul li");
      expect(items).toHaveLength(2);

      expect(items[0]).toHaveClass("success");
      expect(
        within(items[0] as HTMLElement).getByRole("heading", {
          name: "Initial setup.",
        })
      ).toBeInTheDocument();
      expect(items[0].querySelector(".success-description")).toHaveTextContent(
        "success: true"
      );
      expect(items[0].querySelector(".exception-description")).toBeNull();

      expect(items[1]).toHaveClass("failure");
      expect(
        within(items[1] as HTMLElement).getByRole("heading", {
          name: "Acquiring test patron credentials.",
        })
      ).toBeInTheDocument();
      expect(items[1].querySelector(".success-description")).toHaveTextContent(
        "success: false"
      );
      expect(
        items[1].querySelector(".exception-description")
      ).toHaveTextContent(
        "exception: Collection is not associated with any libraries."
      );
    });
  });

  describe("Get new results", () => {
    it("runs the self tests and shows the running indicator while in flight", async () => {
      let resolveRun: () => void;
      fetchSpy.mockImplementation(((_url: string, options: any) => {
        if (options && options.method === "POST") {
          return new Promise((resolve) => {
            resolveRun = () => resolve(new Response("", { status: 200 }));
          });
        }
        return Promise.resolve(getSelfTestsResponse());
      }) as any);

      const { store } = renderSelfTests({ item: collections[0] });
      await settle(store);

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Run tests" }));

      // Dispatching runSelfTests flips the store to fetching, so the component
      // shows the running indicator and posts to the self-tests endpoint.
      expect(
        await screen.findByText("Running new self tests")
      ).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledWith(
        "/admin/collection_self_tests/1",
        expect.objectContaining({ method: "POST" })
      );

      // Resolving the request clears the indicator.
      resolveRun();
      await waitForElementToBeRemoved(() =>
        screen.queryByText("Running new self tests")
      );
    });

    it("shows an error alert when running the self tests fails", async () => {
      fetchSpy.mockImplementation(((_url: string, options: any) => {
        if (options && options.method === "POST") {
          return Promise.resolve(
            new Response(
              JSON.stringify({ detail: "Failed to run new tests." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }
        return Promise.resolve(getSelfTestsResponse());
      }) as any);

      const { store, container } = renderSelfTests({ item: collections[0] });
      await settle(store);
      expect(container.querySelector(".alert")).toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Run tests" }));

      expect(
        await screen.findByText("Error: Failed to run new tests.")
      ).toBeInTheDocument();
      expect(container.querySelector(".alert-danger")).toBeInTheDocument();
    });
  });

  describe("Metadata (sortByCollection) results", () => {
    const base = collections[0].self_test_results.results[0];
    const metadataItem = {
      ...collections[0],
      self_test_results: {
        ...collections[0].self_test_results,
        results: [
          { ...base, collection: "A", name: "Test 1", success: true },
          { ...base, collection: "B", name: "Test 1", success: true },
          { ...base, collection: "A", name: "Test 2", success: true },
          { ...base, collection: "C", name: "Test 1", success: false },
        ],
      },
    };

    it("groups results into one panel per collection", async () => {
      const { store, container } = renderSelfTests({
        item: metadataItem,
        sortByCollection: true,
      });
      await settle(store);

      const titles = Array.from(container.querySelectorAll(".panel-title")).map(
        (el) => el.textContent
      );
      expect(titles).toStrictEqual(["A", "B", "C"]);
    });

    it("marks a collection panel danger when any of its tests failed", async () => {
      const { store, container } = renderSelfTests({
        item: metadataItem,
        sortByCollection: true,
      });
      await settle(store);

      const panels = Array.from(container.querySelectorAll(".panel"));
      const panelFor = (name: string) =>
        panels.find(
          (p) => p.querySelector(".panel-title")?.textContent === name
        );
      expect(panelFor("A")).toHaveClass("panel-success");
      expect(panelFor("B")).toHaveClass("panel-success");
      expect(panelFor("C")).toHaveClass("panel-danger");
    });

    it("labels the initial-setup collection 'Initial Setup'", async () => {
      const initialItem = {
        ...collections[0],
        self_test_results: {
          ...collections[0].self_test_results,
          results: [{ ...base, collection: "undefined", name: "Test 1" }],
        },
      };
      const { store, container } = renderSelfTests({
        item: initialItem,
        sortByCollection: true,
      });
      await settle(store);

      expect(container.querySelector(".panel-title")).toHaveTextContent(
        "Initial Setup"
      );
    });
  });
});
