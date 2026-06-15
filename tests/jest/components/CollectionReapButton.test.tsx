import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CollectionReapButton, {
  CollectionReapButtonProps,
} from "../../../src/components/CollectionReapButton";
import { CollectionData, ProtocolData } from "../../../src/interfaces";

const protocolWithReap: ProtocolData = {
  name: "OPDS 2.0",
  label: "OPDS 2.0",
  supports_reap: true,
  settings: [],
};

const protocolWithoutReap: ProtocolData = {
  name: "Boundless",
  label: "Boundless",
  supports_reap: false,
  settings: [],
};

const savedCollection: CollectionData = {
  id: 42,
  protocol: "OPDS 2.0",
  name: "Test Collection",
};

const unsavedCollection: CollectionData = {
  protocol: "OPDS 2.0",
  name: "Unsaved Collection",
};

function renderButton(overrides: Partial<CollectionReapButtonProps> = {}) {
  const defaultProps: CollectionReapButtonProps = {
    collection: savedCollection,
    protocols: [protocolWithReap, protocolWithoutReap],
    reapCollection: jest.fn().mockResolvedValue(undefined),
    disabled: false,
    ...overrides,
  };
  return {
    ...render(<CollectionReapButton {...defaultProps} />),
    reapCollection: defaultProps.reapCollection as jest.Mock,
  };
}

/** Expand the collapsed Reap panel by clicking its header. */
async function expandPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText("Reap"));
}

describe("CollectionReapButton", () => {
  it("does not render when protocol lacks supports_reap", () => {
    const collection: CollectionData = {
      id: 1,
      protocol: "Boundless",
      name: "Boundless Collection",
    };
    const { container } = renderButton({ collection });
    expect(container.innerHTML).toBe("");
  });

  it("does not render for unsaved collection (no id)", () => {
    const { container } = renderButton({ collection: unsavedCollection });
    expect(container.innerHTML).toBe("");
  });

  it("does not render when the backend omits supports_reap (older CM)", () => {
    // A circulation manager that predates reaping won't include the
    // supports_reap flag at all. The admin must degrade gracefully and hide
    // the panel rather than offering a button that would 404.
    const legacyProtocol: ProtocolData = {
      name: "OPDS 2.0",
      label: "OPDS 2.0",
      settings: [],
    };
    const { container } = renderButton({ protocols: [legacyProtocol] });
    expect(container.innerHTML).toBe("");
  });

  it("renders panel header when supported", () => {
    renderButton();
    expect(screen.getByText("Reap")).toBeInTheDocument();
  });

  it("renders button when panel is expanded and has no force checkbox", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    expect(
      screen.getByRole("button", { name: "Queue Reap" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows compact summary by default; detailed docs are hidden", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    expect(
      screen.getByText(/queue reap removes titles that are no longer/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/schedules a background job that re-reads/i)
    ).not.toBeVisible();
  });

  it("clicking 'More details' reveals the detailed docs", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);

    const details = screen.getByText("More details").closest("details");
    expect(details).not.toHaveAttribute("open");

    await user.click(screen.getByText("More details"));

    expect(details).toHaveAttribute("open");
    expect(
      screen.getByText(/schedules a background job that re-reads/i)
    ).toBeVisible();
  });

  it("button triggers reap with the collection id", async () => {
    const user = userEvent.setup();
    const { reapCollection } = renderButton();
    await expandPanel(user);
    await user.click(screen.getByRole("button", { name: "Queue Reap" }));
    expect(reapCollection).toHaveBeenCalledWith(42);
  });

  it("keeps the feedback live region mounted before any feedback appears", async () => {
    const user = userEvent.setup();
    const { container } = renderButton();
    await expandPanel(user);
    // The live region must already exist when its content mutates; several
    // screen readers won't announce a region inserted alongside its text.
    const liveRegion = container.querySelector(".collection-task-feedback");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toBeEmptyDOMElement();
    expect(liveRegion).toHaveAttribute("aria-live");
  });

  it("shows success feedback after queuing", async () => {
    const user = userEvent.setup();
    renderButton();
    await expandPanel(user);
    await user.click(screen.getByRole("button", { name: "Queue Reap" }));
    await waitFor(() => {
      const feedback = screen.getByText(/reap task queued\./i);
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveClass("alert", "alert-success");
    });
  });

  it("shows error feedback with alert-danger styling on failure", async () => {
    const user = userEvent.setup();
    const mockReap = jest
      .fn()
      .mockRejectedValue({ response: "Something went wrong" });
    renderButton({ reapCollection: mockReap });
    await expandPanel(user);
    await user.click(screen.getByRole("button", { name: "Queue Reap" }));
    await waitFor(() => {
      const feedback = screen.getByText("Something went wrong");
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveClass("alert", "alert-danger");
    });
  });

  it("resets feedback when switching collections", async () => {
    const user = userEvent.setup();
    const { rerender, reapCollection } = renderButton();
    await expandPanel(user);

    await user.click(screen.getByRole("button", { name: "Queue Reap" }));
    await waitFor(() => {
      expect(screen.getByText(/reap task queued\./i)).toBeInTheDocument();
    });

    const nextCollection: CollectionData = {
      id: 99,
      protocol: "OPDS 2.0",
      name: "Another Collection",
    };
    rerender(
      <CollectionReapButton
        collection={nextCollection}
        protocols={[protocolWithReap, protocolWithoutReap]}
        reapCollection={reapCollection}
        disabled={false}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/reap task queued\./i)).not.toBeInTheDocument();
    });
  });

  it("disables button when disabled prop is true", async () => {
    const user = userEvent.setup();
    renderButton({ disabled: true });
    await expandPanel(user);
    expect(screen.getByRole("button", { name: "Queue Reap" })).toBeDisabled();
  });

  it("shows 'Queuing...' text while reaping", async () => {
    const user = userEvent.setup();
    let resolveReap: () => void;
    const pendingReap = new Promise<void>((resolve) => {
      resolveReap = resolve;
    });
    const mockReap = jest.fn().mockReturnValue(pendingReap);
    renderButton({ reapCollection: mockReap });
    await expandPanel(user);

    await user.click(screen.getByRole("button", { name: "Queue Reap" }));

    expect(screen.getByRole("button", { name: "Queuing..." })).toBeDisabled();

    resolveReap();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Queue Reap" })).toBeEnabled();
    });
  });
});
