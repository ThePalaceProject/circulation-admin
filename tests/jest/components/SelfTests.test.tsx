import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { SelfTests } from "../../../src/components/config/SelfTests";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const successResult = {
  duration: 0.000119,
  end: "2018-08-07T19:34:54Z",
  exception: null,
  name: "Initial setup.",
  result: null,
  start: "2018-08-07T19:34:54Z",
  success: true,
};

const failureResult = {
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
};

const collectionWithSuccess = {
  id: 1,
  name: "collection 1",
  protocol: "protocol",
  self_test_results: {
    duration: 1.75,
    start: "2018-08-07T19:34:54Z",
    end: "2018-08-07T19:34:55Z",
    results: [successResult],
  },
};

const collectionWithFailure = {
  ...collectionWithSuccess,
  self_test_results: {
    ...collectionWithSuccess.self_test_results,
    results: [successResult, failureResult],
  },
};

const collectionWithException = {
  ...collectionWithSuccess,
  self_test_results: {
    exception: "Exception getting self-test results for collection ...",
    duration: 0,
    start: "",
    end: "",
    results: [],
  },
};

const collectionWithDisabled = {
  ...collectionWithSuccess,
  self_test_results: {
    ...collectionWithSuccess.self_test_results,
    exception: "Cannot run tests.",
    disabled: true,
  },
};

const newServiceCollection = {
  ...collectionWithSuccess,
  self_test_results: {
    ...collectionWithSuccess.self_test_results,
    exception: "This integration has no attribute 'prior_test_results'",
  },
};

function renderSelfTests(
  overrides: Partial<React.ComponentProps<typeof SelfTests>> = {}
) {
  const defaults = {
    item: collectionWithSuccess,
    type: "collection",
    getSelfTests: jest.fn(),
    sortByCollection: false,
  };
  const props = { ...defaults, ...overrides } as any;
  return render(<SelfTests {...props} />);
}

describe("SelfTests", () => {
  // ─── Structure ───────────────────────────────────────────────────────────────

  it("renders .integration-selftests", () => {
    renderSelfTests();
    expect(
      document.querySelector(".integration-selftests")
    ).toBeInTheDocument();
  });

  // ─── Empty / no results ───────────────────────────────────────────────────────

  it("shows 'No self test results found.' for an item with no results data", () => {
    renderSelfTests({ item: {} as any });
    expect(screen.getByText("No self test results found.")).toBeInTheDocument();
    expect(document.querySelector("ul")).toBeNull();
  });

  // ─── New service ──────────────────────────────────────────────────────────────

  it("shows 'There are no self test results yet.' for new services", () => {
    renderSelfTests({ item: newServiceCollection });
    expect(
      screen.getByText("There are no self test results yet.")
    ).toBeInTheDocument();
    expect(document.querySelector("ul")).toBeNull();
  });

  // ─── Disabled ────────────────────────────────────────────────────────────────

  it("disables the Run tests button when the self test results have disabled=true", () => {
    renderSelfTests({ item: collectionWithDisabled });
    expect(screen.getByRole("button", { name: /Run tests/i })).toBeDisabled();
  });

  // ─── With results ─────────────────────────────────────────────────────────────

  it("renders a results list when there are self test results", () => {
    renderSelfTests({ item: collectionWithSuccess });
    expect(document.querySelector("ul")).toBeInTheDocument();
  });

  it("shows the success icon when all tests pass", () => {
    renderSelfTests({ item: collectionWithSuccess });
    // CheckSoloIcon renders with className="success" — check via SVG
    const successEl = document.querySelector(".success:not(li)");
    expect(successEl).toBeInTheDocument();
    expect(document.querySelector(".failure:not(li)")).toBeNull();
  });

  it("shows the failure icon when any test fails", () => {
    renderSelfTests({ item: collectionWithFailure });
    const failEl = document.querySelector(".failure:not(li)");
    expect(failEl).toBeInTheDocument();
    expect(document.querySelector(".success:not(li)")).toBeNull();
  });

  // ─── Description / date ───────────────────────────────────────────────────────

  it("shows a date/duration description for collections with results", () => {
    renderSelfTests({ item: collectionWithSuccess });
    expect(
      screen.getByText(/Tests last ran on .+ and lasted 1\.75s\./)
    ).toBeInTheDocument();
  });

  it("shows the exception text in the description for top-level exceptions", () => {
    renderSelfTests({ item: collectionWithException });
    expect(
      screen.getByText("Exception getting self-test results for collection ...")
    ).toBeInTheDocument();
  });

  // ─── Result list items ────────────────────────────────────────────────────────

  it("renders success list item with correct class and heading", () => {
    renderSelfTests({ item: collectionWithSuccess });
    const li = document.querySelector("li.success");
    expect(li).toBeInTheDocument();
    expect(li.querySelector("h4").textContent).toBe("Initial setup.");
    expect(li.querySelector(".success-description").textContent).toBe(
      "success: true"
    );
  });

  it("renders failure list item with failure class and exception description", () => {
    renderSelfTests({ item: collectionWithFailure });
    const failureLi = document.querySelector("li.failure");
    expect(failureLi).toBeInTheDocument();
    expect(failureLi.querySelector("h4").textContent).toBe(
      "Acquiring test patron credentials."
    );
    expect(failureLi.querySelector(".exception-description").textContent).toBe(
      "exception: Collection is not associated with any libraries."
    );
  });

  // ─── getSelfTests on mount ────────────────────────────────────────────────────

  it("calls getSelfTests on mount", () => {
    const getSelfTests = jest.fn();
    renderSelfTests({ getSelfTests });
    expect(getSelfTests).toHaveBeenCalledTimes(1);
  });

  // ─── Run tests ────────────────────────────────────────────────────────────────

  it("calls runSelfTests when 'Run tests' button is clicked", async () => {
    const runSelfTests = jest.fn().mockResolvedValue(undefined);
    const getSelfTests = jest.fn();
    renderSelfTests({ runSelfTests, getSelfTests });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Run tests/i }));
    });

    expect(runSelfTests).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when runSelfTests rejects", async () => {
    const fetchError = { status: 400, response: "Failed.", url: "" };
    const runSelfTests = jest.fn().mockRejectedValue(fetchError);
    const getSelfTests = jest.fn();
    renderSelfTests({ runSelfTests, getSelfTests });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Run tests/i }));
    });

    expect(document.querySelector(".alert")).toBeInTheDocument();
  });

  // ─── UNSAFE_componentWillReceiveProps ─────────────────────────────────────────

  it("updates mostRecent when a newer item is provided via new props", () => {
    const getSelfTests = jest.fn();
    const { rerender } = renderSelfTests({
      item: collectionWithSuccess,
      getSelfTests,
    });
    expect(
      screen.getByText(/Tests last ran on .+ and lasted 1\.75s\./)
    ).toBeInTheDocument();

    const updatedCollection = {
      ...collectionWithSuccess,
      self_test_results: {
        ...collectionWithSuccess.self_test_results,
        start: "2018-08-07T20:34:54Z",
        end: "2018-08-07T20:34:55Z",
        duration: 2.5,
      },
    };

    rerender(
      <SelfTests
        item={updatedCollection}
        type="collection"
        getSelfTests={getSelfTests}
        sortByCollection={false}
      />
    );

    expect(
      screen.getByText(/Tests last ran on .+ and lasted 2\.50s\./)
    ).toBeInTheDocument();
  });

  it("does not update mostRecent when an older item is provided", () => {
    const getSelfTests = jest.fn();
    const { rerender } = renderSelfTests({
      item: collectionWithSuccess,
      getSelfTests,
    });

    const olderCollection = {
      ...collectionWithSuccess,
      self_test_results: {
        ...collectionWithSuccess.self_test_results,
        start: "2018-08-07T18:00:00Z",
        duration: 3.0,
      },
    };

    rerender(
      <SelfTests
        item={olderCollection}
        type="collection"
        getSelfTests={getSelfTests}
        sortByCollection={false}
      />
    );

    // Still shows the original 1.75s duration
    expect(
      screen.getByText(/Tests last ran on .+ and lasted 1\.75s\./)
    ).toBeInTheDocument();
  });
});
